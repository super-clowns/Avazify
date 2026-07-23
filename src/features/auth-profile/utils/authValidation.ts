import type {
  ArtistRegistrationInput,
  ListenerRegistrationInput,
  LoginInput,
} from '../types';

export type FormErrors = Record<
  string,
  string
>;

export interface ListenerFormValues
  extends ListenerRegistrationInput {
  confirmPassword: string;
  acceptPrivacyPolicy: boolean;
}

export interface ArtistFormValues
  extends ArtistRegistrationInput {
  confirmPassword: string;
}

export function isValidEmail(
  email: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim(),
  );
}

export function getPasswordError(
  password: string,
) {
  if (!password) {
    return 'وارد کردن رمز عبور الزامی است.';
  }

  if (password.length < 8) {
    return 'رمز عبور باید حداقل ۸ کاراکتر داشته باشد.';
  }

  if (!/[a-zA-Z]/.test(password)) {
    return 'رمز عبور باید حداقل یک حرف انگلیسی داشته باشد.';
  }

  if (!/\d/.test(password)) {
    return 'رمز عبور باید حداقل یک عدد داشته باشد.';
  }

  return '';
}

export function validateLoginForm(
  input: LoginInput,
): FormErrors {
  const errors: FormErrors = {};

  if (!input.email.trim()) {
    errors.email =
      'وارد کردن ایمیل الزامی است.';
  } else if (!isValidEmail(input.email)) {
    errors.email =
      'فرمت ایمیل معتبر نیست.';
  }

  if (!input.password) {
    errors.password =
      'وارد کردن رمز عبور الزامی است.';
  }

  return errors;
}

export function validateListenerRegistration(
  input: ListenerFormValues,
): FormErrors {
  const errors: FormErrors = {};

  if (input.displayName.trim().length < 2) {
    errors.displayName =
      'نام نمایشی باید حداقل ۲ کاراکتر داشته باشد.';
  }

  if (!input.email.trim()) {
    errors.email =
      'وارد کردن ایمیل الزامی است.';
  } else if (!isValidEmail(input.email)) {
    errors.email =
      'فرمت ایمیل معتبر نیست.';
  }

  const passwordError =
    getPasswordError(input.password);

  if (passwordError) {
    errors.password = passwordError;
  }

  if (!input.confirmPassword) {
    errors.confirmPassword =
      'تکرار رمز عبور الزامی است.';
  } else if (
    input.password !== input.confirmPassword
  ) {
    errors.confirmPassword =
      'رمز عبور و تکرار آن یکسان نیستند.';
  }

  if (!input.birthDate) {
    errors.birthDate =
      'انتخاب تاریخ تولد الزامی است.';
  } else {
    const selectedDate = new Date(
      input.birthDate,
    );

    const today = new Date();

    if (
      Number.isNaN(
        selectedDate.getTime(),
      ) ||
      selectedDate > today
    ) {
      errors.birthDate =
        'تاریخ تولد معتبر نیست.';
    }
  }

  if (!input.gender) {
    errors.gender =
      'انتخاب جنسیت الزامی است.';
  }

  if (!input.acceptPrivacyPolicy) {
    errors.acceptPrivacyPolicy =
      'پذیرش سیاست حریم خصوصی الزامی است.';
  }

  return errors;
}

export function validateArtistRegistration(
  input: ArtistFormValues,
): FormErrors {
  const errors: FormErrors = {};

  if (input.artistName.trim().length < 2) {
    errors.artistName =
      'نام هنری باید حداقل ۲ کاراکتر داشته باشد.';
  }

  if (!input.email.trim()) {
    errors.email =
      'وارد کردن ایمیل الزامی است.';
  } else if (!isValidEmail(input.email)) {
    errors.email =
      'فرمت ایمیل معتبر نیست.';
  }

  const passwordError =
    getPasswordError(input.password);

  if (passwordError) {
    errors.password = passwordError;
  }

  if (!input.confirmPassword) {
    errors.confirmPassword =
      'تکرار رمز عبور الزامی است.';
  } else if (
    input.password !== input.confirmPassword
  ) {
    errors.confirmPassword =
      'رمز عبور و تکرار آن یکسان نیستند.';
  }

  if (input.portfolioUrl.trim()) {
    try {
      const url = new URL(
        input.portfolioUrl.trim(),
      );

      if (
        url.protocol !== 'http:' &&
        url.protocol !== 'https:'
      ) {
        errors.portfolioUrl =
          'آدرس نمونه‌کار باید با http یا https شروع شود.';
      }
    } catch {
      errors.portfolioUrl =
        'آدرس نمونه‌کار معتبر نیست.';
    }
  }

  if (
    !input.portfolioUrl.trim() &&
    input.portfolioFileNames.length === 0
  ) {
    errors.portfolio =
      'حداقل یک لینک یا فایل نمونه‌کار وارد کنید.';
  }

  return errors;
}

export function validateResetEmail(
  email: string,
): FormErrors {
  if (!email.trim()) {
    return {
      email:
        'وارد کردن ایمیل الزامی است.',
    };
  }

  if (!isValidEmail(email)) {
    return {
      email:
        'فرمت ایمیل معتبر نیست.',
    };
  }

  return {};
}