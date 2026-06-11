import type { ActorType } from "@/types/domain/actor.types";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupDoctorInput = LoginCredentials & {
  full_name: string;
};

export type SignupAdminInput = LoginCredentials & {
  full_name: string;
};

export type AuthActor = {
  actorType: ActorType;
};
