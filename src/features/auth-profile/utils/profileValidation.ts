import type {
  ProfileUpdateInput,
  UserGender,
} from '../types';

export interface ProfileFormValues {
  displayName: string;
  email: string;
  bio: string;
  birthDate: string;
  gender: UserGender;
  avatar: string | null;
}

export type ProfileFormErrors =
  Partial<
    Record<
      keyof ProfileFormValues,
      string
    >
  >;

function isValidEmail(
  email: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim(),
  );
}

// Validate profile edit values.
export function validateProfileForm(
  values: ProfileFormValues,
): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  const displayName =
    values.displayName.trim();

  if (!displayName) {
    errors.displayName =
      'وارد کردن نام نمایشی الزامی است.';
  } else if (displayName.length < 2) {
    errors.displayName =
      'نام نمایشی باید حداقل ۲ کاراکتر داشته باشد.';
  } else if (displayName.length > 50) {
    errors.displayName =
      'نام نمایشی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد.';
  }

  if (!values.email.trim()) {
    errors.email =
      'وارد کردن ایمیل الزامی است.';
  } else if (
    !isValidEmail(values.email)
  ) {
    errors.email =
      'فرمت ایمیل معتبر نیست.';
  }

  if (values.bio.length > 300) {
    errors.bio =
      'بیوگرافی نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد.';
  }

  if (!values.birthDate) {
    errors.birthDate =
      'انتخاب تاریخ تولد الزامی است.';
  } else {
    const birthDate = new Date(
      values.birthDate,
    );

    const today = new Date();

    if (
      Number.isNaN(
        birthDate.getTime(),
      )
    ) {
      errors.birthDate =
        'تاریخ تولد معتبر نیست.';
    } else if (birthDate > today) {
      errors.birthDate =
        'تاریخ تولد نمی‌تواند در آینده باشد.';
    }
  }

  if (!values.gender) {
    errors.gender =
      'انتخاب جنسیت الزامی است.';
  }

  return errors;
}

// Convert form values to context input.
export function toProfileUpdateInput(
  values: ProfileFormValues,
): ProfileUpdateInput {
  return {
    displayName:
      values.displayName.trim(),

    email:
      values.email
        .trim()
        .toLowerCase(),

    bio: values.bio.trim(),

    birthDate:
      values.birthDate || null,

    gender: values.gender,

    avatar: values.avatar,
  };
}