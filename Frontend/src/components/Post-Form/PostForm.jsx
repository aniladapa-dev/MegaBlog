import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Select, RTE } from "../index";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function PostForm({ post }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
  } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      status: post?.status || "active",
      category: post?.category || "general",
    },
  });

  const navigate = useNavigate();

  //  Get logged-in user safely
  const userData = useSelector((state) => state.auth?.userData);

  //  Slug generator (clean & correct)
  const slugTransform = useCallback((value) => {
    if (typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    return "";
  }, []);

  // Auto-generate slug when title changes
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), {
          shouldValidate: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  //  Submit handler (create & update)
  const submit = async (data) => {
    try {
      // ✏️ UPDATE POST
      if (post) {
        const file = data.image?.[0]
          ? await appwriteService.uploadFile(data.image[0])
          : null;

        if (file) {
          await appwriteService.deleteFile(post.featuredImage);
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          title: data.title,
          slug: data.slug,
          content: data.content,
          status: data.status || "active",
          category: data.category,
          featuredImage: file ? file.$id : post.featuredImage,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id || dbPost.slug}`);
        }
      }

      //  CREATE POST
      else {
        const file = data.image?.[0] ? await appwriteService.uploadFile(data.image[0]) : null;

        const dbPost = await appwriteService.createPost({
          title: data.title,
          slug: data.slug,
          content: data.content,
          status: data.status || "active",
          category: data.category,
          featuredImage: file ? file.$id : null,
          userid: userData ? userData.$id : null,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id || dbPost.slug}`);
        }
      }
    } catch (error) {
      console.error("Post submit error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} 
        className="flex flex-wrap overflow-visible -mx-3">
      {/* LEFT SECTION */}
      <div className="w-full lg:w-2/3 px-3 mb-6 lg:mb-0">
        <Input
          label="Title :"
          placeholder="Title"
          className="mb-4"
          {...register("title", { required: true })}
        />

        <Input
          label="Slug :"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) =>
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            })
          }
        />

        <RTE
          label="Content :"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-1/3 px-3 overflow-visible relative">
        <Input
          label="Featured Image :"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />

        {/* Image preview (edit mode) */}
        {post && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              className="rounded-lg"
            />
          </div>
        )}

        <div className="relative z-50">
        <Select
            options={["general", "technology", "react", "spring boot", "java", "devops", "docker", "ai", "comedy", "motivation", "travel", "others"]}
            label="Category"
            className="mb-4"
            {...register("category", { required: true })}
        />
        </div>


        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default PostForm;
