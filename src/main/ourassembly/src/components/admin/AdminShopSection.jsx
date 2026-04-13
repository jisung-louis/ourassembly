import { useEffect, useState } from 'react'
import { fetchProducts, deleteProduct } from '../../services/communityApi.js'
import { ProductForm } from '../Community/Shop/ProductForm.jsx'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export function AdminShopSection() {
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const loadData = () => {
        setIsLoading(true)
        fetchProducts({ sort: 'latest', page, size: 10 })
            .then((data) => {
                setProducts(data.content || [])
                setTotalPages(data.totalPages || 1)
            })
            .catch((e) => console.error(e))
            .finally(() => setIsLoading(false))
    }

    useEffect(() => { loadData() }, [page])

    const handleDelete = async (productId) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return
        try {
            await deleteProduct(productId)
            alert('삭제되었습니다.')
            loadData()
        } catch (e) {
            alert(e.message)
        }
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div className="admin-page-title">상품 관리</div>
                <button
                    className="admin-sync-btn admin-sync-btn--green"
                    onClick={() => { setSelectedProduct(null); setIsModalOpen(true) }}
                >
                    + 신규 상품 등록
                </button>
            </div>

            {isLoading ? (
                <div className="admin-loading"><div className="comm-spinner" /></div>
            ) : (
                <div className="admin-section">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#9ca3af' }}>이미지</th>
                            <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#9ca3af' }}>상품명</th>
                            <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#9ca3af' }}>가격</th>
                            <th style={{ padding: '10px', textAlign: 'right', fontWeight: '600', color: '#9ca3af' }}>재고</th>
                            <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#9ca3af' }}>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>등록된 상품이 없습니다.</td>
                            </tr>
                        ) : products.map((p) => {
                            const imageUrl = p.imageUrl?.startsWith('/upload/')
                                ? `${BASE}${p.imageUrl}`
                                : p.imageUrl

                            return (
                                <tr key={p.productId} style={{ borderBottom: '0.5px solid #f4f4f4' }}>
                                    <td style={{ padding: '10px' }}>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={p.name}
                                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                        ) : (
                                            <div style={{ width: '48px', height: '48px', background: '#f4f4f4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎁</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', color: '#1c1917', fontWeight: '500' }}>{p.name}</td>
                                    <td style={{ padding: '10px', textAlign: 'right', color: '#1D9E75', fontWeight: '600' }}>{p.price?.toLocaleString()}P</td>
                                    <td style={{ padding: '10px', textAlign: 'right', color: p.stock === 0 ? '#D85A30' : '#1c1917' }}>{p.stock ?? 0}개</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button
                                                className="admin-sync-btn admin-sync-btn--green"
                                                style={{ padding: '4px 12px', fontSize: '12px' }}
                                                onClick={() => { setSelectedProduct(p); setIsModalOpen(true) }}
                                            >
                                                수정/재고
                                            </button>
                                            <button
                                                style={{ padding: '4px 12px', fontSize: '12px', border: '0.5px solid #F09595', borderRadius: '8px', background: 'transparent', color: '#A32D2D', cursor: 'pointer' }}
                                                onClick={() => handleDelete(p.productId)}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            style={{
                                padding: '6px 12px', fontSize: '13px', borderRadius: '8px',
                                border: '0.5px solid #e5e7eb', cursor: 'pointer',
                                background: page === p ? '#1D9E75' : 'transparent',
                                color: page === p ? '#fff' : '#1c1917'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}

            <ProductForm
                isOpen={isModalOpen}
                product={selectedProduct}
                onClose={() => setIsModalOpen(false)}
                onSave={loadData}
            />
        </div>
    )
}