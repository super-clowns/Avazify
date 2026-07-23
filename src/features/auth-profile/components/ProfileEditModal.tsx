import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Modal from '../../../components/Modal';

import { useAuth } from '../hooks/useAuth';

import type {
  UserGender,
} from '../types';

import {
  toProfileUpdateInput,
  validateProfileForm,
  type ProfileFormErrors,
  type ProfileFormValues,
} from '../utils/profileValidation';

import {
  getAvatarInitial,
  getSubscriptionLabel,
} from '../utils/userPresentation';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_AVATAR_SIZE =
  512 * 1024;

const ALLOWED_AVATAR_TYPES =
  new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

// Edit the current user profile.
export default function ProfileEditModal({
  isOpen,
  onClose,
}: ProfileEditModalProps) {
  const {
    currentUser,
    updateProfile,
  } = useAuth();

  const [
    form,
    setForm,
  ] = useState<ProfileFormValues>({
    displayName: '',
    email: '',
    bio: '',
    birthDate: '',
    gender:
      'prefer-not-to-say',
    avatar: null,
  });

  const [
    errors,
    setErrors,
  ] = useState<ProfileFormErrors>(
    {},
  );

  const [
    serverError,
    setServerError,
  ] = useState('');

  const [
    avatarError,
    setAvatarError,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  useEffect(() => {
    if (
      !isOpen ||
      !currentUser
    ) {
      return;
    }

    setForm({
      displayName:
        currentUser.displayName,

      email:
        currentUser.email,

      bio:
        currentUser.bio,

      birthDate:
        currentUser.birthDate ??
        '',

      gender:
        currentUser.gender,

      avatar:
        currentUser.avatar,
    });

    setErrors({});
    setServerError('');
    setAvatarError('');
  }, [
    currentUser,
    isOpen,
  ]);

  if (!currentUser) {
    return null;
  }

  const canEditAvatar =
    currentUser.subscription.tier !==
    'free';

  const updateField = <
    Key extends
      keyof ProfileFormValues,
  >(
    key: Key,
    value:
      ProfileFormValues[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: '',
    }));

    setServerError('');
  };

  const handleAvatarChange = (
    event:
      ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    if (!canEditAvatar) {
      setAvatarError(
        'برای تغییر عکس پروفایل باید اشتراک نقره‌ای یا طلایی داشته باشید.',
      );

      return;
    }

    if (
      !ALLOWED_AVATAR_TYPES.has(
        file.type,
      )
    ) {
      setAvatarError(
        'فرمت عکس باید JPG، PNG یا WEBP باشد.',
      );

      return;
    }

    if (
      file.size >
      MAX_AVATAR_SIZE
    ) {
      setAvatarError(
        'حجم عکس نباید بیشتر از ۵۱۲ کیلوبایت باشد.',
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result !==
        'string'
      ) {
        setAvatarError(
          'خواندن فایل تصویر با خطا مواجه شد.',
        );

        return;
      }

      updateField(
        'avatar',
        reader.result,
      );

      setAvatarError('');
    };

    reader.onerror = () => {
      setAvatarError(
        'خواندن فایل تصویر با خطا مواجه شد.',
      );
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (!canEditAvatar) {
      return;
    }

    updateField(
      'avatar',
      null,
    );

    setAvatarError('');
  };

  const handleSubmit = (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors =
      validateProfileForm(form);

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
      updateProfile(
        toProfileUpdateInput(
          form,
        ),
      );

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(
        result.message,
      );

      return;
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="ویرایش اطلاعات پروفایل"
      size="large"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            انصراف
          </Button>

          <Button
            type="submit"
            form="profile-edit-form"
            isLoading={isSubmitting}
          >
            ذخیره تغییرات
          </Button>
        </>
      }
    >
      <form
        id="profile-edit-form"
        className="profile-edit-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {serverError ? (
          <div
            className="auth-alert auth-alert-error"
            role="alert"
          >
            <span className="auth-alert-icon">
              !
            </span>

            <span>
              {serverError}
            </span>
          </div>
        ) : null}

        <section className="profile-edit-avatar-section">
          <div className="profile-edit-avatar-preview">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="پیش‌نمایش عکس پروفایل"
              />
            ) : (
              <span>
                {getAvatarInitial(
                  currentUser,
                )}
              </span>
            )}
          </div>

          <div className="profile-edit-avatar-content">
            <strong>
              عکس پروفایل
            </strong>

            <p>
              فرمت‌های مجاز:
              <span dir="ltr">
                {' '}
                JPG, PNG, WEBP
              </span>
              . حداکثر حجم فایل
              ۵۱۲ کیلوبایت است.
            </p>

            <div className="profile-edit-avatar-actions">
              <label
                className={`ui-button ui-button-secondary ui-button-small ${
                  !canEditAvatar
                    ? 'profile-upload-disabled'
                    : ''
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={
                    !canEditAvatar
                  }
                  onChange={
                    handleAvatarChange
                  }
                />

                انتخاب عکس
              </label>

              {form.avatar &&
              canEditAvatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={
                    handleRemoveAvatar
                  }
                >
                  حذف عکس
                </Button>
              ) : null}
            </div>

            {!canEditAvatar ? (
              <div className="profile-avatar-restriction">
                تغییر عکس پروفایل برای
                کاربران اشتراک پایه
                غیرفعال است. اشتراک فعلی:{' '}
                <strong>
                  {getSubscriptionLabel(
                    currentUser
                      .subscription
                      .tier,
                  )}
                </strong>
              </div>
            ) : null}

            {avatarError ? (
              <p className="auth-form-field-error">
                {avatarError}
              </p>
            ) : null}
          </div>
        </section>

        <div className="profile-edit-grid">
          <Input
            name="displayName"
            type="text"
            label="نام نمایشی"
            placeholder="نامی که در برنامه نمایش داده می‌شود"
            value={
              form.displayName
            }
            error={
              errors.displayName
            }
            onChange={(event) =>
              updateField(
                'displayName',
                event.target.value,
              )
            }
          />

          <Input
            name="email"
            type="email"
            label="ایمیل"
            placeholder="name@example.com"
            value={form.email}
            error={errors.email}
            onChange={(event) =>
              updateField(
                'email',
                event.target.value,
              )
            }
          />

          <Input
            name="birthDate"
            type="date"
            label="تاریخ تولد"
            value={
              form.birthDate
            }
            error={
              errors.birthDate
            }
            onChange={(event) =>
              updateField(
                'birthDate',
                event.target.value,
              )
            }
          />

          <label
            className="ui-field"
            htmlFor="profile-gender"
          >
            <span className="ui-field-label">
              جنسیت
            </span>

            <span
              className={`ui-input-wrapper ${
                errors.gender
                  ? 'ui-input-error'
                  : ''
              }`}
            >
              <select
                id="profile-gender"
                name="gender"
                className="ui-input ui-select"
                value={form.gender}
                onChange={(event) =>
                  updateField(
                    'gender',
                    event.target
                      .value as UserGender,
                  )
                }
              >
                <option value="female">
                  زن
                </option>

                <option value="male">
                  مرد
                </option>

                <option value="other">
                  سایر
                </option>

                <option value="prefer-not-to-say">
                  ترجیح می‌دهم نگویم
                </option>
              </select>
            </span>

            {errors.gender ? (
              <span className="auth-form-field-error">
                {errors.gender}
              </span>
            ) : null}
          </label>
        </div>

        <label
          className="ui-field"
          htmlFor="profile-bio"
        >
          <span className="ui-field-label">
            بیوگرافی
          </span>

          <span
            className={`profile-textarea-wrapper ${
              errors.bio
                ? 'ui-input-error'
                : ''
            }`}
          >
            <textarea
              id="profile-bio"
              name="bio"
              className="profile-textarea"
              rows={5}
              maxLength={300}
              placeholder="توضیح کوتاهی درباره خودتان بنویسید."
              value={form.bio}
              onChange={(event) =>
                updateField(
                  'bio',
                  event.target.value,
                )
              }
            />
          </span>

          <span className="profile-bio-counter">
            {form.bio.length.toLocaleString(
              'fa-IR',
            )}{' '}
            از ۳۰۰ کاراکتر
          </span>

          {errors.bio ? (
            <span className="auth-form-field-error">
              {errors.bio}
            </span>
          ) : null}
        </label>

        <div className="profile-username-note">
          <strong>
            نام کاربری:
          </strong>

          <code dir="ltr">
            @{currentUser.username}
          </code>

          <p>
            نام کاربری توسط سامانه
            اختصاص داده شده و در این
            فاز قابل تغییر نیست.
          </p>
        </div>
      </form>
    </Modal>
  );
}