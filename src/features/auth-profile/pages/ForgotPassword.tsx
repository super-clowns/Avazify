import {
  useState,
  type FormEvent,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import Button from '../../../components/Button';
import Input from '../../../components/Input';

import {
  APP_PATHS,
} from '../../../config/paths';

import { useAuth } from '../hooks/useAuth';

import {
  validateResetEmail,
  type FormErrors,
} from '../utils/authValidation';

// Mock password recovery.
export default function ForgotPasswordPage() {
  const {
    requestPasswordReset,
  } = useAuth();

  const [email, setEmail] =
    useState('');

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors =
      validateResetEmail(email);

    if (
      Object.keys(
        validationErrors,
      ).length > 0
    ) {
      setErrors(
        validationErrors,
      );

      return;
    }

    setIsSubmitting(true);

    const result =
      requestPasswordReset(
        email,
      );

    setIsSubmitting(false);

    setSuccessMessage(
      result.message,
    );
  };

  return (
    <main className="simple-auth-page">
      <section className="simple-auth-card">
        <div
          className="simple-auth-icon"
          aria-hidden="true"
        >
          ✉
        </div>

        <p className="page-eyebrow">
          بازیابی حساب
        </p>

        <h1>
          فراموشی رمز عبور
        </h1>

        <p className="simple-auth-description">
          ایمیل حساب خود را وارد
          کنید. ارسال ایمیل در این
          فاز به‌صورت آزمایشی
          شبیه‌سازی می‌شود.
        </p>

        {successMessage ? (
          <div className="reset-success-panel">
            <strong>
              درخواست ثبت شد
            </strong>

            <p>
              {successMessage}
            </p>
          </div>
        ) : (
          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <Input
              name="email"
              type="email"
              label="ایمیل حساب"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              error={errors.email}
              onChange={(event) => {
                setEmail(
                  event.target.value,
                );

                setErrors({});
              }}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              isLoading={isSubmitting}
            >
              ارسال لینک بازیابی
            </Button>
          </form>
        )}

        {successMessage ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setSuccessMessage('');
              setEmail('');
            }}
          >
            ارسال برای ایمیل دیگر
          </Button>
        ) : null}

        <Link
          className="back-link"
          to={APP_PATHS.login}
        >
          بازگشت به صفحه ورود
        </Link>
      </section>
    </main>
  );
}