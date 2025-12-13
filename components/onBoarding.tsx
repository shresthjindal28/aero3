"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DoctorOnboarding() {
  const router = useRouter();
  const [form, setForm] = useState({
    doctor_name: "",
    hospital_id: "",
    phone_number: "",
  });

  const [files, setFiles] = useState<{
    certificate: File | null;
    id_document: File | null;
    profile: File | null;
  }>({
    certificate: null,
    id_document: null,
    profile: null,
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  }

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "certificate" | "id_document" | "profile"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles((prev) => ({ ...prev, [field]: file }));

    if (field === "profile") {
      setProfilePreview(URL.createObjectURL(file));
    }
  }

  function validate() {
    const err: Record<string, string> = {};
    if (!form.phone_number.trim()) err.phone_number = "Phone number is required";
    if (!files.certificate) err.certificate = "Certificate is required";
    if (!files.id_document) err.id_document = "ID document is required";
    return err;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("phone_number", form.phone_number);
      fd.append("certificate", files.certificate as File);
      fd.append("id_document", files.id_document as File);
      fd.append("doctor_name", form.doctor_name);

      const res = await fetch("/api/doctor/register", {
        method: "POST",
        body: fd,
      });
      alert("Onboarding submitted successfully");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl my-10 mx-auto p-4">
      <Card className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Doctor Onboarding</h2>
        <p className="text-sm text-muted-foreground">
          Fill out the details below to create your profile.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24 rounded-lg">
              {profilePreview ? (
                <Image
                  src={profilePreview}
                  alt="profile preview"
                  width={96}
                  height={96}
                  unoptimized
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                  A
                </div>
              )}
            </Avatar>

            <div className="flex-1">
              <Label className="mb-1" htmlFor="profile_image">
                Profile image (optional)
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-input">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload</span>
                  <input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFile(e, "profile")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="doctor_name">Doctor name</Label>
            <Input
              id="doctor_name"
              name="doctor_name"
              value={form.doctor_name}
              onChange={handleChange}
              placeholder="Dr. Jane Doe"
            />
          </div>

          <div>
            <Label htmlFor="hospital_id">Hospital ID (optional)</Label>
            <Input
              id="hospital_id"
              name="hospital_id"
              value={form.hospital_id}
              onChange={handleChange}
              placeholder="HOSP-12345"
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              placeholder="+1 555-555-5555"
            />
            {errors.phone_number && (
              <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>
            )}
          </div>

          <div>
            <Label htmlFor="certificate">Certificate</Label>
            <div className="mt-2 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-input">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload certificate</span>
                <input
                  id="certificate"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleFile(e, "certificate")}
                  className="hidden"
                />
              </label>
            </div>
            {errors.certificate && (
              <p className="text-xs text-red-500 mt-1">{errors.certificate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="id_document">ID document</Label>
            <div className="mt-2 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-input">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload ID document</span>
                <input
                  id="id_document"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleFile(e, "id_document")}
                  className="hidden"
                />
              </label>
            </div>
            {errors.id_document && (
              <p className="text-xs text-red-500 mt-1">{errors.id_document}</p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Create profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
