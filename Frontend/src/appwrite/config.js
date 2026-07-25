export class Service {
  baseUrl = import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api/posts` 
    : "http://localhost:8080/api/posts";
  fileUrl = import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api/files` 
    : "http://localhost:8080/api/files";

  // helper to get the JWT token
  getHeaders() {
    const token = sessionStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  }

  // POSTS -------------------------

  async createPost({ title, slug, content, featuredImage, status, category }) {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          title,
          slug,
          content,
          featuredImage,
          status,
          category,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create post");
      }

      return await response.json();
    } catch (error) {
      console.error("Service createPost error:", error);
      throw error;
    }
  }

  async updatePost(slugOrId, { title, slug, content, featuredImage, status, category }) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify({
          title,
          slug,
          content,
          featuredImage,
          status,
          category,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update post");
      }

      return await response.json();
    } catch (error) {
      console.error("Service updatePost error:", error);
      throw error;
    }
  }

  async getPost(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      return await response.json();
    } catch (error) {
      console.error("Service getPost error:", error);
      return null;
    }
  }

  async getPosts(params = {}) {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.category) queryParams.append("category", params.category);
      if (params.search) queryParams.append("search", params.search);

      const url = `${this.baseUrl}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      return await response.json();
    } catch (error) {
      console.error("Service getPosts error:", error);
      return { documents: [], total: 0 };
    }
  }

  async deletePost(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      return true;
    } catch (error) {
      console.error("Service deletePost error:", error);
      return false;
    }
  }
  // LIKES -------------------------

  async toggleLike(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}/like`, {
        method: "POST",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      return await response.json();
    } catch (error) {
      console.error("Service toggleLike error:", error);
      return null;
    }
  }

  async getLikeStatus(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}/like-status`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to get like status");
      }

      return await response.json();
    } catch (error) {
      console.error("Service getLikeStatus error:", error);
      return { liked: false, likesCount: 0 };
    }
  }

  // COMMENTS -------------------------

  async addComment(slugOrId, content) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}/comments`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      return await response.json();
    } catch (error) {
      console.error("Service addComment error:", error);
      return null;
    }
  }

  async getComments(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}/comments`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to get comments");
      }

      return await response.json();
    } catch (error) {
      console.error("Service getComments error:", error);
      return [];
    }
  }

  async deleteComment(commentId) {
    try {
      const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return true;
    } catch (error) {
      console.error("Service deleteComment error:", error);
      return false;
    }
  }

  // BOOKMARKS -------------------------

  async toggleBookmark(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}/bookmark`, {
        method: "POST",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle bookmark");
      }

      return await response.json();
    } catch (error) {
      console.error("Service toggleBookmark error:", error);
      return null;
    }
  }

  async getBookmarkStatus(slugOrId) {
    try {
      const response = await fetch(`${this.baseUrl}/${slugOrId}/bookmark-status`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to get bookmark status");
      }

      return await response.json();
    } catch (error) {
      console.error("Service getBookmarkStatus error:", error);
      return { bookmarked: false };
    }
  }

  async getBookmarks() {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/bookmarks`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to get bookmarks");
      }

      return await response.json();
    } catch (error) {
      console.error("Service getBookmarks error:", error);
      return { documents: [], total: 0 };
    }
  }

  // FILES -------------------------

  async uploadFile(file) {
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.fileUrl}/upload`, {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      return await response.json();
    } catch (error) {
      console.error("Service uploadFile error:", error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      if (!fileId) return;
      const token = sessionStorage.getItem("token");

      const response = await fetch(`${this.fileUrl}/${fileId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      return true;
    } catch (error) {
      console.error("Service deleteFile error:", error);
      return false;
    }
  }

  getFileView(fileId) {
    if (!fileId) return null;
    if (fileId.startsWith("http://") || fileId.startsWith("https://")) {
      return fileId;
    }
    return `${this.fileUrl}/${fileId}`;
  }

  getFilePreview(fileId) {
    if (!fileId) return null;
    if (fileId.startsWith("http://") || fileId.startsWith("https://")) {
      return fileId;
    }
    return `${this.fileUrl}/${fileId}`;
  }
}

const service = new Service();
export default service;
