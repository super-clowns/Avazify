import { useState } from 'react';
import Button from '../../../components/Button';

import RejectionModal from './RejectionModal';
import { mockArtistRequests } from '../data/mockArtistRequests';
import type { ArtistVerificationRequest } from '../types';

export default function ArtistRequestsTable() {
  const [requests, setRequests] = useState<ArtistVerificationRequest[]>(mockArtistRequests);
  const [selected, setSelected] = useState<ArtistVerificationRequest | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const approve = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)),
    );
    setSelected(null);
  };

  const rejectWithReason = (reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selected?.id ? { ...r, status: 'rejected', rejectionReason: reason } : r,
      ),
    );
    setIsRejectOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th>نام هنری</th>
            <th>ایمیل</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.artistName}</td>
              <td dir="ltr">{request.email}</td>
              <td>
                <span className={`status-pill status-pill-${request.status}`}>
                  {request.status === 'pending'
                    ? 'در انتظار تایید'
                    : request.status === 'approved'
                    ? 'تایید شده'
                    : 'رد شده'}
                </span>
              </td>
              <td>
                {request.status === 'pending' ? (
                  <button
                    type="button"
                    className="inline-text-button"
                    onClick={() => setSelected(request)}
                  >
                    مشاهده نمونه کار
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected ? (
        <div className="content-card">
          <h3>بررسی درخواست: {selected.artistName}</h3>
          <p>
            نمونه کار: <a href={selected.portfolioUrl}>{selected.portfolioUrl}</a>
          </p>
          <ul>
            {selected.portfolioFileNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>

          <div className="page-actions">
            <Button onClick={() => approve(selected.id)}>تایید</Button>
            <Button variant="danger" onClick={() => setIsRejectOpen(true)}>
              رد درخواست
            </Button>
          </div>
        </div>
      ) : null}

      <RejectionModal
        isOpen={isRejectOpen}
        artistName={selected?.artistName ?? ''}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={rejectWithReason}
      />
    </div>
  );
}