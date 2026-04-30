// src/admin/GalleryPage.tsx
/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
  Grid,
  List,
  AlertCircle,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Edit2,
  Save,
  XCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import AdminLayout from "../../layouts/AdminLayout";

// Design tokens matching Reservations page
const P = {
  pink: "#f472b6",
  pinkDim: "rgba(244,114,182,0.45)",
  pinkGhost: "rgba(244,114,182,0.07)",
  border: "rgba(244,114,182,0.10)",
  card: "rgba(17,13,22,0.7)",
  muted: "rgba(255,255,255,0.28)",
};

// Types
interface GalleryImage {
  id: string;
  image_url: string;
  alt_text: string;
  caption: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface UploadProgress {
  [key: string]: number;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editForm, setEditForm] = useState({ alt_text: "", caption: "" });

  // Form state for single image upload
  const [singleImage, setSingleImage] = useState<{
    file: File | null;
    alt_text: string;
    caption: string;
    preview: string;
  }>({
    file: null,
    alt_text: "",
    caption: "",
    preview: "",
  });

  // Fetch images
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle single file selection
  const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    const preview = URL.createObjectURL(file);
    setSingleImage({
      file,
      alt_text: "",
      caption: "",
      preview,
    });
  };

  // Handle multiple files selection
  const handleMultipleFilesSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} size should be less than 10MB`);
        return false;
      }
      return true;
    });

    setSelectedImages((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload single image
  const uploadSingleImage = async () => {
    if (!singleImage.file) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const fileExt = singleImage.file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, singleImage.file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("gallery_images").insert([
        {
          image_url: publicUrl,
          alt_text: singleImage.alt_text || "Gallery image",
          caption: singleImage.caption || "",
          order_index: images.length,
        },
      ]);

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully!");
      setShowUploadModal(false);
      resetSingleForm();
      fetchImages();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Upload multiple images
  const uploadMultipleImages = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please select images to upload");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      try {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        const altText = file.name.split(".")[0].replace(/[_-]/g, " ");

        const { error: dbError } = await supabase
          .from("gallery_images")
          .insert([
            {
              image_url: publicUrl,
              alt_text: altText,
              caption: "",
              order_index: images.length + i,
            },
          ]);

        if (dbError) throw dbError;

        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        successCount++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(
        `Successfully uploaded ${successCount} image${successCount > 1 ? "s" : ""}`,
      );
      fetchImages();
    }
    if (failCount > 0) {
      toast.error(
        `Failed to upload ${failCount} image${failCount > 1 ? "s" : ""}`,
      );
    }

    setUploading(false);
    resetMultipleForm();
  };

  // Delete image
  const deleteImage = async (image: GalleryImage) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setDeletingIds((prev) => new Set(prev).add(image.id));
    try {
      const urlParts = image.image_url.split("/");
      const filePath = `gallery/${urlParts[urlParts.length - 1]}`;

      const { error: storageError } = await supabase.storage
        .from("images")
        .remove([filePath]);

      if (storageError) console.error("Storage delete error:", storageError);

      const { error: dbError } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", image.id);

      if (dbError) throw dbError;

      toast.success("Image deleted successfully!");
      fetchImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
    }
  };

  // Update image metadata
  const updateImageMetadata = async (image: GalleryImage) => {
    try {
      const { error } = await supabase
        .from("gallery_images")
        .update({
          alt_text: editForm.alt_text,
          caption: editForm.caption,
          updated_at: new Date().toISOString(),
        })
        .eq("id", image.id);

      if (error) throw error;

      toast.success("Image details updated!");
      setEditingImage(null);
      fetchImages();
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image details");
    }
  };

  // Update image order
  const updateOrder = async (images: GalleryImage[]) => {
    try {
      const updates = images.map((image, index) => ({
        id: image.id,
        order_index: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("gallery_images")
          .update({ order_index: update.order_index })
          .eq("id", update.id);

        if (error) throw error;
      }

      setImages(images);
      toast.success("Order updated successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  // Move image up/down
  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    [newImages[index], newImages[newIndex]] = [
      newImages[newIndex],
      newImages[index],
    ];
    updateOrder(newImages);
  };

  const resetSingleForm = () => {
    if (singleImage.preview) URL.revokeObjectURL(singleImage.preview);
    setSingleImage({
      file: null,
      alt_text: "",
      caption: "",
      preview: "",
    });
  };

  const resetMultipleForm = () => {
    selectedImages.forEach((_, index) => {
      URL.revokeObjectURL(imagePreviews[index]);
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setUploadProgress({});
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (singleImage.preview) URL.revokeObjectURL(singleImage.preview);
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [singleImage.preview, imagePreviews]);

  const counts = {
    total: images.length,
  };

  return (
    <AdminLayout
      title="Gallery Management"
      subtitle="Manage your gallery images"
    >
      <div
        className="min-h-screen"
        
      >
        <div className="p-2">
          {/* Header Stats */}
          <div className="flex gap-2 flex-wrap mb-5">
            {[["total", "Total Images", counts.total, P.pink]].map(
              ([key, label, count, color]) => {
                const active = true;
                const colorStr = color as string;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                    style={{
                      background: active
                        ? `${colorStr}14`
                        : "rgba(255,255,255,0.03)",
                      border: active
                        ? `1px solid ${colorStr}35`
                        : "1px solid rgba(255,255,255,0.06)",
                      color: active ? colorStr : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {label}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {count}
                    </span>
                  </div>
                );
              },
            )}
          </div>

          {/* Actions Bar */}
          <div
            className="rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-3 mb-5"
            style={{ background: P.card, border: `1px solid ${P.border}` }}
          >
            <div className="flex gap-2">
              <div className="flex bg-gray-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-pink-500/20 text-pink-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-pink-500/20 text-pink-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={fetchImages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                style={{
                  background: P.pinkGhost,
                  border: `1px solid ${P.border}`,
                  color: P.pinkDim,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = P.pink)}
                onMouseLeave={(e) => (e.currentTarget.style.color = P.pinkDim)}
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
              style={{
                background: `${P.pink}20`,
                border: `1px solid ${P.pink}35`,
                color: P.pink,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = `${P.pink}30`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = `${P.pink}20`)
              }
            >
              <Plus size={14} /> Add Images
            </button>
          </div>

          <p
            className="text-xs mb-3"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Showing <span style={{ color: P.pinkDim }}>{images.length}</span>{" "}
            image{images.length !== 1 ? "s" : ""}
          </p>

          {/* Image Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: P.pink }}
              />
            </div>
          ) : images.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: P.card, border: `1px solid ${P.border}` }}
            >
              <ImageIcon
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: "rgba(244,114,182,0.15)" }}
              />
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                No images yet
              </h3>
              <p className="mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Start adding images to your gallery
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer mx-auto"
                style={{
                  background: `${P.pink}20`,
                  border: `1px solid ${P.pink}35`,
                  color: P.pink,
                }}
              >
                <Upload size={14} /> Upload First Image
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: P.card,
                    border: `1px solid ${P.border}`,
                  }}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <button
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        className="p-2 rounded-full transition-all transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: P.card, color: P.pink }}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveImage(index, "down")}
                        disabled={index === images.length - 1}
                        className="p-2 rounded-full transition-all transform hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: P.card, color: P.pink }}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingImage(image);
                          setEditForm({
                            alt_text: image.alt_text,
                            caption: image.caption || "",
                          });
                        }}
                        className="p-2 rounded-full transition-all transform hover:scale-110"
                        style={{ background: P.card, color: P.pink }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteImage(image)}
                        disabled={deletingIds.has(image.id)}
                        className="p-2 rounded-full transition-all transform hover:scale-110"
                        style={{ background: P.card, color: "#fb7185" }}
                      >
                        {deletingIds.has(image.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "rgba(255,255,255,0.8)" }}
                    >
                      {image.alt_text}
                    </p>
                    {image.caption && (
                      <p
                        className="text-xs mt-1 truncate"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        {image.caption}
                      </p>
                    )}
                    <p
                      className="text-[10px] mt-2 font-mono"
                      style={{ color: P.pinkDim }}
                    >
                      Order: {index + 1}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${P.border}`, background: P.card }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(244,114,182,0.06)",
                      }}
                    >
                      {["Image", "Alt Text", "Caption", "Order", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: "rgba(255,255,255,0.18)" }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {images.map((image, index) => (
                      <tr
                        key={image.id}
                        style={{
                          borderBottom:
                            index < images.length - 1
                              ? "1px solid rgba(244,114,182,0.04)"
                              : "none",
                        }}
                      >
                        <td className="px-5 py-3">
                          <img
                            src={image.image_url}
                            alt={image.alt_text}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </td>
                        <td className="px-5 py-3">
                          {editingImage?.id === image.id ? (
                            <input
                              type="text"
                              value={editForm.alt_text}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  alt_text: e.target.value,
                                })
                              }
                              className="px-2 py-1 rounded text-sm outline-none w-full"
                              style={{
                                background: "rgba(10,5,14,0.9)",
                                border: `1px solid ${P.border}`,
                                color: "#fff",
                              }}
                              autoFocus
                            />
                          ) : (
                            <span
                              className="text-sm"
                              style={{ color: "rgba(255,255,255,0.7)" }}
                            >
                              {image.alt_text}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {editingImage?.id === image.id ? (
                            <input
                              type="text"
                              value={editForm.caption}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  caption: e.target.value,
                                })
                              }
                              className="px-2 py-1 rounded text-sm outline-none w-full"
                              style={{
                                background: "rgba(10,5,14,0.9)",
                                border: `1px solid ${P.border}`,
                                color: "#fff",
                              }}
                            />
                          ) : (
                            <span
                              className="text-sm"
                              style={{ color: "rgba(255,255,255,0.4)" }}
                            >
                              {image.caption || "-"}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveImage(index, "up")}
                              disabled={index === 0}
                              className="p-1 rounded transition-all disabled:opacity-30"
                              style={{ color: P.pinkDim }}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <span
                              className="text-xs font-mono"
                              style={{ color: "rgba(255,255,255,0.5)" }}
                            >
                              {index + 1}
                            </span>
                            <button
                              onClick={() => moveImage(index, "down")}
                              disabled={index === images.length - 1}
                              className="p-1 rounded transition-all disabled:opacity-30"
                              style={{ color: P.pinkDim }}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {editingImage?.id === image.id ? (
                              <>
                                <button
                                  onClick={() => updateImageMetadata(image)}
                                  className="p-1.5 rounded transition-all hover:scale-110"
                                  style={{ color: "#4ade80" }}
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingImage(null)}
                                  className="p-1.5 rounded transition-all hover:scale-110"
                                  style={{ color: "#fb7185" }}
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingImage(image);
                                    setEditForm({
                                      alt_text: image.alt_text,
                                      caption: image.caption || "",
                                    });
                                  }}
                                  className="p-1.5 rounded transition-all hover:scale-110"
                                  style={{ color: P.pink }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteImage(image)}
                                  disabled={deletingIds.has(image.id)}
                                  className="p-1.5 rounded transition-all hover:scale-110"
                                  style={{ color: "#fb7185" }}
                                >
                                  {deletingIds.has(image.id) ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              style={{
                background: "linear-gradient(160deg,#110d16,#0a0610)",
                border: `1px solid ${P.border}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 flex justify-between items-center p-4 border-b"
                style={{
                  borderColor: P.border,
                  background: "rgba(17,13,22,0.95)",
                }}
              >
                <h2 className="text-xl font-semibold" style={{ color: "#fff" }}>
                  Upload Images
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 rounded-lg transition-colors hover:bg-white/10"
                >
                  <X className="w-5 h-5" style={{ color: P.muted }} />
                </button>
              </div>

              <div className="p-6">
                {/* Single Image Upload */}
                <div className="mb-6">
                  <h3
                    className="font-medium mb-3"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Single Image Upload
                  </h3>
                  <div
                    className="border-2 border-dashed rounded-lg p-4"
                    style={{ borderColor: `${P.pink}30` }}
                  >
                    {!singleImage.preview ? (
                      <label className="block text-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSingleFileSelect}
                          className="hidden"
                        />
                        <Upload
                          className="w-8 h-8 mx-auto mb-2"
                          style={{ color: P.pinkDim }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          Click to select an image
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </label>
                    ) : (
                      <div>
                        <img
                          src={singleImage.preview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                        <input
                          type="text"
                          placeholder="Alt text (required)"
                          value={singleImage.alt_text}
                          onChange={(e) =>
                            setSingleImage((prev) => ({
                              ...prev,
                              alt_text: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg mb-2 outline-none"
                          style={{
                            background: "rgba(10,5,14,0.9)",
                            border: `1px solid ${P.border}`,
                            color: "#fff",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={singleImage.caption}
                          onChange={(e) =>
                            setSingleImage((prev) => ({
                              ...prev,
                              caption: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-lg mb-2 outline-none"
                          style={{
                            background: "rgba(10,5,14,0.9)",
                            border: `1px solid ${P.border}`,
                            color: "#fff",
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={uploadSingleImage}
                            disabled={uploading}
                            className="flex-1 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                            style={{
                              background: `${P.pink}20`,
                              border: `1px solid ${P.pink}35`,
                              color: P.pink,
                            }}
                          >
                            {uploading ? "Uploading..." : "Upload"}
                          </button>
                          <button
                            onClick={resetSingleForm}
                            className="px-4 py-2 rounded-lg transition-all"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: `1px solid ${P.border}`,
                              color: P.muted,
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiple Images Upload */}
                <div>
                  <h3
                    className="font-medium mb-3"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    Multiple Images Upload
                  </h3>
                  <div
                    className="border-2 border-dashed rounded-lg p-4"
                    style={{ borderColor: `${P.pink}30` }}
                  >
                    {selectedImages.length === 0 ? (
                      <label className="block text-center cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMultipleFilesSelect}
                          className="hidden"
                        />
                        <Upload
                          className="w-8 h-8 mx-auto mb-2"
                          style={{ color: P.pinkDim }}
                        />
                        <p
                          className="text-sm"
                          style={{ color: "rgba(255,255,255,0.6)" }}
                        >
                          Click to select multiple images
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    ) : (
                      <div>
                        <div className="grid grid-cols-3 gap-3 mb-4 max-h-64 overflow-y-auto">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                              />
                              <button
                                onClick={() => removeSelectedImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ background: "#fb7185", color: "#fff" }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                              {uploadProgress[selectedImages[index]?.name] ===
                                -1 && (
                                <div className="absolute inset-0 bg-red-500/50 rounded-lg flex items-center justify-center">
                                  <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={uploadMultipleImages}
                            disabled={uploading}
                            className="flex-1 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                            style={{
                              background: `${P.pink}20`,
                              border: `1px solid ${P.pink}35`,
                              color: P.pink,
                            }}
                          >
                            {uploading
                              ? "Uploading..."
                              : `Upload ${selectedImages.length} Image${selectedImages.length > 1 ? "s" : ""}`}
                          </button>
                          <button
                            onClick={resetMultipleForm}
                            className="px-4 py-2 rounded-lg transition-all"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: `1px solid ${P.border}`,
                              color: P.muted,
                            }}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default GalleryPage;
