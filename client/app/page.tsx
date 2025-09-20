"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Building2,
  Users,
  FileText,
  MapPin,
  Camera,
  Upload,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { userStore } from "@/zustand/store";
import { useRouter } from "next/navigation";
import axiosIns from "@/lib/axios";

const complaintSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title is too long"),
  description: z
    .string()
    .min(10, "Please provide more details about the issue")
    .max(500, "Description is too long"),
  location: z
    .string()
    .min(5, "Please provide a specific location")
    .max(200, "Location is too long"),
  category: z.string().min(1, "Please select a category"),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const ComplaintFormPage = () => {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const { user } = userStore();

  useEffect(() => {
    function checkUser() {
      if (user == null) {
        router.push("/sign-in");
      }
    }

    checkUser();
  }, []);

  const complaintCategories = [
    "Road & Infrastructure",
    "Water Supply Issues",
    "Garbage & Sanitation",
    "Streetlight Problems",
    "Drainage & Sewerage",
    "Public Transport",
    "Noise Pollution",
    "Illegal Construction",
    "Park & Garden Issues",
    "Other Issues",
  ];

  const form = useForm<ComplaintFormData>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
    },
    resolver: zodResolver(complaintSchema),
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const submitComplaint = async (data: ComplaintFormData) => {
    const imageBlobs = await Promise.all(
      selectedImages.map(async (img) => {
        const base64 = await fileToBase64(img.file);
        return {
          name: img.file.name,
          type: img.file.type,
          size: img.file.size,
          data: base64,
        };
      })
    );

    const complaintData = {
      ...data,
      images: imageBlobs,
      status: "pending",
      createdBy: user?.id,
    };

    const response = await axiosIns.post("/api/complaints", complaintData);
    return response.data;
  };

  const complaintMutation = useMutation({
    mutationFn: submitComplaint,
    onSuccess: (data: any) => {
      console.log("Complaint submitted successfully:", data);
      toast.success(
        "Complaint submitted successfully! You will receive updates on the status."
      );
      form.reset();
      setSelectedImages([]);
    },
    onError: (error: any) => {
      console.error("Complaint submission failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit complaint. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview, id });
      }
    });

    setSelectedImages((prev) => [...prev, ...newImages].slice(0, 5)); // Max 5 images
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return updated;
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const onSubmit = (data: ComplaintFormData) => {
    complaintMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Submit Complaint
          </h1>
          <p className="text-muted-foreground">
            Report issues in your area to the municipal corporation
          </p>
          <Badge variant="secondary" className="mt-2">
            <Users className="w-4 h-4 mr-1" />
            Citizen Portal
          </Badge>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">New Complaint</CardTitle>
            <CardDescription>
              Provide details about the issue you want us to resolve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Complaint Details</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={complaintMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select complaint category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {complaintCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Brief title for your complaint"
                            disabled={complaintMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Describe the issue in detail"
                            disabled={complaintMutation.isPending}
                            className="min-h-[80px] resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="Specific address or landmark"
                              className="pl-10"
                              disabled={complaintMutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Camera className="w-4 h-4 text-primary" />
                    <h3 className="font-medium">Photos (Optional)</h3>
                    <Badge variant="outline" className="text-xs">
                      Max 5 images, 5MB each
                    </Badge>
                  </div>

                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop images here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                      disabled={complaintMutation.isPending}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      disabled={complaintMutation.isPending}
                    >
                      Select Images
                    </Button>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.preview}
                            alt="Preview"
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(image.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {image.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  className="w-full"
                  disabled={complaintMutation.isPending}
                  size="lg"
                >
                  {complaintMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Complaint...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your complaint will be reviewed and assigned to the
                    appropriate department. You will receive updates via email
                    and can track the status online.
                  </AlertDescription>
                </Alert>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintFormPage;
