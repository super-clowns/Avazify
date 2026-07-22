import { useParams } from 'react-router-dom';

import Button from '../../../components/Button';
import PhasePlaceholder from '../components/PhasePlaceholder';

// User profile page foundation.
export default function ProfilePage() {
  const { username } = useParams<{
    username: string;
  }>();

  const displayedUsername =
    username ?? 'sample_listener';

  const isOwnProfile = !username;

  return (
    <PhasePlaceholder
      eyebrow="User Module / Profile"
      title={
        isOwnProfile
          ? 'نمایه کاربری من'
          : `نمایه ${displayedUsername}`
      }
      description="ساختار نمایش اطلاعات شخصی، آمار و عملیات نمایه آماده شده است. منطق ویرایش و دنبال‌کردن در فازهای بعد متصل می‌شود."
      items={[
        'مسیر مستقل برای نمایه شخصی و نمایه سایر کاربران',
        'نمایش نام کاربری، نوع اشتراک و آمار استریم روزانه',
        'جایگاه عملیات ویرایش، دنبال‌کردن و لغو دنبال‌کردن',
        'طراحی واکنش‌گرا برای موبایل، تبلت و دسکتاپ',
      ]}
      actions={
        <Button
          variant={
            isOwnProfile
              ? 'secondary'
              : 'primary'
          }
        >
          {isOwnProfile
            ? 'ویرایش نمایه'
            : 'دنبال کردن'}
        </Button>
      }
    >
      <section className="profile-card">
        <div className="profile-banner">
          <div className="profile-banner-shape profile-banner-shape-one" />
          <div className="profile-banner-shape profile-banner-shape-two" />
        </div>

        <div className="profile-main-row">
          <div className="avatar avatar-large">
            ک
          </div>

          <div className="profile-identity">
            <div className="profile-name-row">
              <h2>کاربر نمونه</h2>

              <span className="subscription-pill subscription-pill-free">
                پایه
              </span>
            </div>

            <p dir="ltr">
              @{displayedUsername}
            </p>

            <span>
              عضو آوازیفای از بهار ۱۴۰۵
            </span>
          </div>
        </div>

        <div className="profile-stat-grid">
          <article>
            <span>دنبال‌کننده</span>
            <strong>۱۲۸</strong>
          </article>

          <article>
            <span>دنبال‌شونده</span>
            <strong>۷۶</strong>
          </article>

          <article>
            <span>استریم امروز</span>
            <strong>۱۸ از ۶۰</strong>
          </article>

          <article>
            <span>پلی‌لیست‌ها</span>
            <strong>۳ از ۶</strong>
          </article>
        </div>
      </section>

      <div className="profile-detail-grid">
        <section className="content-card">
          <div className="content-card-heading">
            <h2>اطلاعات شخصی</h2>

            {isOwnProfile ? (
              <button
                type="button"
                className="inline-text-button"
              >
                ویرایش
              </button>
            ) : null}
          </div>

          <dl className="profile-detail-list">
            <div>
              <dt>نام نمایشی</dt>
              <dd>کاربر نمونه</dd>
            </div>

            <div>
              <dt>ایمیل</dt>

              <dd dir="ltr">
                sample@avazify.local
              </dd>
            </div>

            <div>
              <dt>تاریخ تولد</dt>
              <dd>۱۳۸۲/۰۵/۱۲</dd>
            </div>

            <div>
              <dt>جنسیت</dt>

              <dd>
                ترجیح می‌دهم نگویم
              </dd>
            </div>
          </dl>
        </section>

        <section className="content-card">
          <div className="content-card-heading">
            <h2>وضعیت اشتراک</h2>
          </div>

          <div className="subscription-summary">
            <div className="subscription-summary-icon">
              ◇
            </div>

            <div>
              <strong>اشتراک پایه</strong>

              <p>
                ۶۰ استریم روزانه و حداکثر
                ۶ پلی‌لیست
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
          >
            مشاهده گزینه‌های ارتقا
          </Button>
        </section>
      </div>
    </PhasePlaceholder>
  );
}