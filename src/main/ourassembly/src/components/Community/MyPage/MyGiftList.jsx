import React from 'react';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function MyGiftList({ gifts = [] }) {
    if (gifts.length === 0) return (
        <div className="comm-empty">보유하신 기프티콘이 없습니다.</div>
    );

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {gifts.map((gift) => {
                const imageUrl = gift.imageUrl?.startsWith('/upload/')
                    ? `${BASE}${gift.imageUrl}`
                    : gift.imageUrl

                return (
                    <div key={gift.barcodeId} style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                        {/* 상품 이미지 */}
                        <div style={{
                            width: '100%',
                            height: '140px',
                            background: '#f9f9f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={gift.productName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{ fontSize: '40px' }}>🎁</span>
                            )}
                        </div>

                        <div style={{ padding: '14px' }}>
                            {/* 상품 이름 */}
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#1c1917',
                                marginBottom: '12px',
                                letterSpacing: '-0.02em',
                            }}>
                                {gift.productName}
                            </div>

                            {/* QR코드 */}
                            <div style={{
                                background: '#f4f4f4',
                                borderRadius: '12px',
                                padding: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                            }}>
                                <span style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600', letterSpacing: '0.05em' }}>QR CODE</span>
                                {gift.qrImagePath ? (
                                    <img
                                        src={`${BASE}${gift.qrImagePath}`}
                                        alt="QR코드"
                                        style={{
                                            width: '130px',
                                            height: '130px',
                                            borderRadius: '8px',
                                            background: '#fff',
                                            padding: '6px',
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: '12px', color: '#9ca3af', padding: '20px 0' }}>QR코드 없음</span>
                                )}
                            </div>

                            {/* 유효기간 */}
                            <div style={{
                                marginTop: '10px',
                                fontSize: '11px',
                                color: '#9ca3af',
                                textAlign: 'center',
                            }}>
                                유효기간: {gift.expiredAt ? gift.expiredAt.split('T')[0] : '기한 없음'}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}