import React from 'react';

export function MyGiftList({ gifts = [] }) {
    if (gifts.length === 0) return <div className="comm-empty">보유하신 기프티콘이 없습니다.</div>;

    return (
        <div className="shop-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {gifts.map((gift) => (
                <div key={gift.barcodeId} className="product-card" style={{ border: '1px solid #eee', padding: '10px', borderRadius: '12px' }}>
                    <div className="product-card__img" style={{ height: '120px', background: '#f9f9f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {gift.imageUrl ? (
                            <img src={gift.imageUrl} alt={gift.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                            <span style={{ fontSize: '30px' }}>🎁</span>
                        )}
                    </div>

                    <div className="product-card__info">
                        <div className="product-card__name" style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '14px' }}>
                            {gift.productName}
                        </div>

                        <div className="barcode-box" style={{ marginTop: '8px', background: '#f4f4f4', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                            <span style={{ fontSize: '9px', color: '#888', display: 'block' }}>BARCODE</span>
                            <strong style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '1px' }}>
                                {gift.barcodeNo}
                            </strong>
                        </div>

                        <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', textAlign: 'center' }}>
                            유효기간: {gift.expiredAt ? gift.expiredAt.split('T')[0] : '기한 없음'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}