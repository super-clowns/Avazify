import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Modal from '../../../components/Modal';

import {
  APP_PATHS,
} from '../../../config/paths';

import { useAuth } from '../hooks/useAuth';

import type {
  UserGender,
} from '../types';

import {
  validateArtistRegistration,
  validateListenerRegistration,
  type ArtistFormValues,
  type FormErrors,
  type ListenerFormValues,
} from '../utils/authValidation';

type RegisterMode =
  | 'listener'
  | 'artist';

const initialListenerForm: ListenerFormValues =
  {
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender:
      '' as UserGender,
    acceptPrivacyPolicy:
      false,
  };

const initialArtistForm: ArtistFormValues =
  {
    artistName: '',
    email: '',
    password: '',
    confirmPassword: '',
    portfolioUrl: '',
    portfolioFileNames: [],
  };

// Registration with validation.
export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    registerListener,
    registerArtist,
  } = useAuth();

  const [mode, setMode] =
    useState<RegisterMode>(
      'listener',
    );

  const [
    listenerForm,
    setListenerForm,
  ] = useState<ListenerFormValues>(
    initialListenerForm,
  );

  const [
    artistForm,
    setArtistForm,
  ] = useState<ArtistFormValues>(
    initialArtistForm,
  );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [
    serverError,
    setServerError,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const changeMode = (
    nextMode: RegisterMode,
  ) => {
    setMode(nextMode);
    setErrors({});
    setServerError('');
  };

  const updateListenerField = (
    field:
      keyof ListenerFormValues,
    value:
      | string
      | boolean,
  ) => {
    setListenerForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setErrors((current) => ({
      ...current,
      [field]: '',
    }));

    setServerError('');
  };

  const updateArtistField = (
    field:
      keyof ArtistFormValues,
    value:
      | string
      | string[],
  ) => {
    setArtistForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setErrors((current) => ({
      ...current,
      [field]: '',
      portfolio: '',
    }));

    setServerError('');
  };

  const handlePortfolioFiles = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    const fileNames = files.map(
      (file) => file.name,
    );

    updateArtistField(
      'portfolioFileNames',
      fileNames,
    );

    event.target.value = '';
  };

  const removePortfolioFile = (
    fileName: string,
  ) => {
    updateArtistField(
      'portfolioFileNames',
      artistForm.portfolioFileNames.filter(
        (item) =>
          item !== fileName,
      ),
    );
  };

  const handleListenerSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors =
      validateListenerRegistration(
        listenerForm,
      );

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
      registerListener({
        displayName:
          listenerForm.displayName,
        email:
          listenerForm.email,
        password:
          listenerForm.password,
        birthDate:
          listenerForm.birthDate,
        gender:
          listenerForm.gender,
      });

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(
        result.message,
      );

      return;
    }

    navigate(
      APP_PATHS.home,
      {
        replace: true,
      },
    );
  };

  const handleArtistSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationErrors =
      validateArtistRegistration(
        artistForm,
      );

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
      registerArtist({
        artistName:
          artistForm.artistName,
        email:
          artistForm.email,
        password:
          artistForm.password,
        portfolioUrl:
          artistForm.portfolioUrl,
        portfolioFileNames:
          artistForm
            .portfolioFileNames,
      });

    setIsSubmitting(false);

    if (!result.success) {
      setServerError(
        result.message,
      );

      return;
    }

    navigate(
      APP_PATHS.home,
      {
        replace: true,
      },
    );
  };

  return (
    <>
      <main className="auth-shell auth-shell-register">
        <section
          className="auth-visual auth-visual-register"
          aria-label="ثبت‌نام در آوازیفای"
        >
          <div className="auth-visual-content">
            <div className="auth-brand-mark">
              A
            </div>

            <p className="auth-visual-eyebrow">
              CREATE YOUR ACCOUNT
            </p>

            <h1>
              یک حساب برای شنیدن، یا
              یک حساب برای ساختن
              موسیقی.
            </h1>

            <p>
              کاربران عادی بلافاصله
              وارد سامانه می‌شوند و
              درخواست هنرمندان در
              وضعیت انتظار تأیید قرار
              می‌گیرد.
            </p>
          </div>
        </section>

        <section className="auth-form-panel auth-form-panel-wide">
          <div className="auth-form-card auth-form-card-wide">
            <div className="auth-form-heading">
              <p className="page-eyebrow">
                ایجاد حساب جدید
              </p>

              <h2>
                ثبت‌نام در آوازیفای
              </h2>

              <p>
                نوع حساب موردنظر خود
                را انتخاب کنید.
              </p>
            </div>

            <div
              className="segmented-control"
              role="tablist"
              aria-label="نوع حساب"
            >
              <button
                type="button"
                role="tab"
                aria-selected={
                  mode === 'listener'
                }
                className={
                  mode === 'listener'
                    ? 'segmented-control-active'
                    : ''
                }
                onClick={() =>
                  changeMode(
                    'listener',
                  )
                }
              >
                کاربر عادی
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  mode === 'artist'
                }
                className={
                  mode === 'artist'
                    ? 'segmented-control-active'
                    : ''
                }
                onClick={() =>
                  changeMode(
                    'artist',
                  )
                }
              >
                حساب هنرمند
              </button>
            </div>

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

            {mode === 'listener' ? (
              <form
                className="auth-form"
                onSubmit={
                  handleListenerSubmit
                }
                noValidate
              >
                <div className="form-grid form-grid-two">
                  <Input
                    name="displayName"
                    type="text"
                    label="نام نمایشی"
                    placeholder="مثلاً نیما"
                    autoComplete="name"
                    value={
                      listenerForm
                        .displayName
                    }
                    error={
                      errors.displayName
                    }
                    onChange={(event) =>
                      updateListenerField(
                        'displayName',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="email"
                    type="email"
                    label="ایمیل"
                    placeholder="name@example.com"
                    autoComplete="email"
                    value={
                      listenerForm.email
                    }
                    error={errors.email}
                    onChange={(event) =>
                      updateListenerField(
                        'email',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    label="رمز عبور"
                    placeholder="حداقل ۸ کاراکتر"
                    autoComplete="new-password"
                    value={
                      listenerForm
                        .password
                    }
                    error={
                      errors.password
                    }
                    onChange={(event) =>
                      updateListenerField(
                        'password',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="confirmPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    label="تکرار رمز عبور"
                    placeholder="رمز را تکرار کنید"
                    autoComplete="new-password"
                    value={
                      listenerForm
                        .confirmPassword
                    }
                    error={
                      errors.confirmPassword
                    }
                    onChange={(event) =>
                      updateListenerField(
                        'confirmPassword',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="birthDate"
                    type="date"
                    label="تاریخ تولد"
                    value={
                      listenerForm
                        .birthDate
                    }
                    error={
                      errors.birthDate
                    }
                    onChange={(event) =>
                      updateListenerField(
                        'birthDate',
                        event.target
                          .value,
                      )
                    }
                  />

                  <label
                    className="ui-field"
                    htmlFor="gender"
                  >
                    <span className="ui-field-label">
                      جنسیت
                    </span>

                    <span
                      className={`ui-input-wrapper ${
                        errors.gender
                          ? 'auth-select-error'
                          : ''
                      }`}
                    >
                      <select
                        id="gender"
                        name="gender"
                        className="ui-input ui-select"
                        value={
                          listenerForm
                            .gender
                        }
                        onChange={(event) =>
                          updateListenerField(
                            'gender',
                            event.target
                              .value,
                          )
                        }
                      >
                        <option
                          value=""
                          disabled
                        >
                          انتخاب کنید
                        </option>

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
                          ترجیح می‌دهم
                          نگویم
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

                <ul className="password-rules">
                  <li>
                    حداقل ۸ کاراکتر
                  </li>

                  <li>
                    شامل حداقل یک حرف
                    انگلیسی
                  </li>

                  <li>
                    شامل حداقل یک عدد
                  </li>
                </ul>

                <label className="auth-show-password">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(
                        event.target
                          .checked,
                      )
                    }
                  />

                  <span>
                    نمایش رمزهای عبور
                  </span>
                </label>

                <label className="ui-checkbox ui-checkbox-policy">
                  <input
                    name="acceptPrivacyPolicy"
                    type="checkbox"
                    checked={
                      listenerForm
                        .acceptPrivacyPolicy
                    }
                    onChange={(event) =>
                      updateListenerField(
                        'acceptPrivacyPolicy',
                        event.target
                          .checked,
                      )
                    }
                  />

                  <span>
                    با{' '}
                    <button
                      type="button"
                      className="inline-text-button"
                      onClick={() =>
                        setIsPrivacyModalOpen(
                          true,
                        )
                      }
                    >
                      سیاست حریم خصوصی
                    </button>{' '}
                    موافقم.
                  </span>
                </label>

                {errors.acceptPrivacyPolicy ? (
                  <p className="auth-form-field-error">
                    {
                      errors.acceptPrivacyPolicy
                    }
                  </p>
                ) : null}

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  isLoading={
                    isSubmitting
                  }
                >
                  ایجاد حساب کاربری
                </Button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={
                  handleArtistSubmit
                }
                noValidate
              >
                <div className="form-grid form-grid-two">
                  <Input
                    name="artistName"
                    type="text"
                    label="نام هنری"
                    placeholder="نام نمایشی هنرمند"
                    value={
                      artistForm
                        .artistName
                    }
                    error={
                      errors.artistName
                    }
                    onChange={(event) =>
                      updateArtistField(
                        'artistName',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="artistEmail"
                    type="email"
                    label="ایمیل"
                    placeholder="artist@example.com"
                    autoComplete="email"
                    value={
                      artistForm.email
                    }
                    error={errors.email}
                    onChange={(event) =>
                      updateArtistField(
                        'email',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="artistPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    label="رمز عبور"
                    placeholder="حداقل ۸ کاراکتر"
                    autoComplete="new-password"
                    value={
                      artistForm
                        .password
                    }
                    error={
                      errors.password
                    }
                    onChange={(event) =>
                      updateArtistField(
                        'password',
                        event.target
                          .value,
                      )
                    }
                  />

                  <Input
                    name="artistConfirmPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    label="تکرار رمز عبور"
                    placeholder="رمز را تکرار کنید"
                    autoComplete="new-password"
                    value={
                      artistForm
                        .confirmPassword
                    }
                    error={
                      errors.confirmPassword
                    }
                    onChange={(event) =>
                      updateArtistField(
                        'confirmPassword',
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <Input
                  name="portfolioUrl"
                  type="url"
                  label="لینک نمونه‌کار"
                  placeholder="https://example.com/portfolio"
                  value={
                    artistForm
                      .portfolioUrl
                  }
                  error={
                    errors.portfolioUrl
                  }
                  onChange={(event) =>
                    updateArtistField(
                      'portfolioUrl',
                      event.target
                        .value,
                    )
                  }
                />

                <div className="upload-placeholder">
                  <span
                    className="upload-placeholder-icon"
                    aria-hidden="true"
                  >
                    ↑
                  </span>

                  <div>
                    <strong>
                      بارگذاری نمونه‌کار
                    </strong>

                    <p>
                      فایل‌ها در این فاز
                      فقط به‌صورت نام
                      فایل نگهداری
                      می‌شوند.
                    </p>
                  </div>

                  <label className="portfolio-file-control">
                    <input
                      type="file"
                      multiple
                      accept="audio/*,video/*,image/*,.pdf"
                      onChange={
                        handlePortfolioFiles
                      }
                    />

                    <span className="ui-button ui-button-secondary ui-button-small">
                      انتخاب فایل
                    </span>
                  </label>
                </div>

                {artistForm
                  .portfolioFileNames
                  .length > 0 ? (
                  <div className="portfolio-file-list">
                    {artistForm
                      .portfolioFileNames
                      .map((fileName) => (
                        <span
                          className="portfolio-file-item"
                          key={fileName}
                        >
                          <span>
                            {fileName}
                          </span>

                          <button
                            type="button"
                            aria-label={`حذف ${fileName}`}
                            onClick={() =>
                              removePortfolioFile(
                                fileName,
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                ) : null}

                {errors.portfolio ? (
                  <p className="auth-form-field-error">
                    {errors.portfolio}
                  </p>
                ) : null}

                <ul className="password-rules">
                  <li>
                    حداقل ۸ کاراکتر
                  </li>

                  <li>
                    شامل حداقل یک حرف
                    انگلیسی و یک عدد
                  </li>
                </ul>

                <label className="auth-show-password">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(event) =>
                      setShowPassword(
                        event.target
                          .checked,
                      )
                    }
                  />

                  <span>
                    نمایش رمزهای عبور
                  </span>
                </label>

                <div className="registration-status-card">
                  پس از ثبت درخواست،
                  حساب هنرمند در وضعیت
                  «در انتظار تأیید»
                  قرار می‌گیرد و تا
                  زمان تأیید، مدیریت
                  آثار فعال نخواهد بود.
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  isLoading={
                    isSubmitting
                  }
                >
                  ارسال درخواست هنرمندی
                </Button>
              </form>
            )}

            <p className="auth-switch-text">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link
                to={APP_PATHS.login}
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Modal
        isOpen={isPrivacyModalOpen}
        title="سیاست حریم خصوصی آوازیفای"
        onClose={() =>
          setIsPrivacyModalOpen(
            false,
          )
        }
        footer={
          <Button
            onClick={() =>
              setIsPrivacyModalOpen(
                false,
              )
            }
          >
            مطالعه کردم
          </Button>
        }
      >
        <div className="privacy-policy-content">
          <h3>
            اطلاعات حساب کاربری
          </h3>

          <p>
            اطلاعاتی مانند نام نمایشی،
            ایمیل، تاریخ تولد و تنظیمات
            برنامه برای ایجاد و مدیریت
            حساب کاربری استفاده
            می‌شوند.
          </p>

          <h3>
            فعالیت‌های موسیقی
          </h3>

          <p>
            اطلاعات مربوط به
            پلی‌لیست‌ها، دنبال‌کردن
            کاربران و تاریخچه پخش برای
            ارائه امکانات سامانه
            نگهداری خواهند شد.
          </p>

          <h3>
            اطلاعات پرداخت
          </h3>

          <p>
            اطلاعات پرداخت در فاز
            بک‌اند و از طریق درگاه
            پرداخت آزمایشی مدیریت
            خواهد شد و در این نسخه
            فرانت‌اند ذخیره نمی‌شود.
          </p>

          <h3>
            کنترل اطلاعات
          </h3>

          <p>
            کاربر می‌تواند اطلاعات
            نمایه و تنظیمات خود را
            ویرایش کند و درخواست حذف
            حساب را از صفحه تنظیمات
            ارسال نماید.
          </p>
        </div>
      </Modal>
    </>
  );
}