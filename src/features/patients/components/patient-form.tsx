"use client";

import type { UseFormReturn } from "react-hook-form";

import {
  bloodGroupOptions,
  genderOptions,
  type PatientFormValues,
} from "@/features/patients/schemas/patient.schema";
import { FormField } from "@/shared/forms/form-field";
import { FormSection } from "@/shared/forms/form-section";
import { Input } from "@/shared/ui/primitives/input";
import { Select } from "@/shared/ui/primitives/select";
import { Textarea } from "@/shared/ui/primitives/textarea";

type PatientFormProps = {
  form: UseFormReturn<PatientFormValues>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children?: React.ReactNode;
};

export function PatientForm({ form, onSubmit, children }: PatientFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <FormSection title="Identity" description="Core patient demographics.">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="full_name"
            label="Full name"
            render={({ field }) => <Input autoComplete="name" {...field} />}
          />
          <FormField
            control={form.control}
            name="phone"
            label="Phone"
            render={({ field }) => <Input type="tel" autoComplete="tel" {...field} />}
          />
          <FormField
            control={form.control}
            name="gender"
            label="Gender"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="">Select gender</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
          <FormField
            control={form.control}
            name="date_of_birth"
            label="Date of birth"
            render={({ field }) => <Input type="date" {...field} />}
          />
          <FormField
            control={form.control}
            name="blood_group"
            label="Blood group"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="">Select blood group</option>
                {bloodGroupOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Clinical context" description="Information that informs care decisions.">
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="allergies"
            label="Allergies"
            render={({ field }) => <Textarea rows={3} {...field} />}
          />
          <FormField
            control={form.control}
            name="medical_history"
            label="Medical history"
            render={({ field }) => <Textarea rows={3} {...field} />}
          />
          <FormField
            control={form.control}
            name="current_medications"
            label="Current medications"
            render={({ field }) => <Textarea rows={3} {...field} />}
          />
        </div>
      </FormSection>

      <FormSection title="Emergency & location">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="emergency_contact_name"
            label="Emergency contact name"
            render={({ field }) => <Input {...field} />}
          />
          <FormField
            control={form.control}
            name="emergency_contact_phone"
            label="Emergency contact phone"
            render={({ field }) => <Input type="tel" {...field} />}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="address"
              label="Address"
              render={({ field }) => <Textarea rows={2} {...field} />}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="notes"
              label="Notes"
              render={({ field }) => <Textarea rows={3} {...field} />}
            />
          </div>
        </div>
      </FormSection>

      {children}
    </form>
  );
}
