import { useState, useEffect } from 'react'
import { getAuthorizationHeader } from '../../../services/auth.js'
import './ProductForm.css'
import axios from 'axios'
import { apiClient as client, resolveApiAssetUrl } from '../../../services/apiClient.js'

function auth() {
    const h = getAuthorizationHeader()
    return h ? { Authorization: h } : {}
}

function errMsg(e, fb) {
    if (!axios.isAxiosError(e) || !e.response) return fb
    const b = e.response.data
    if (typeof b === 'string' && b.trim()) return b
    if (b?.message) return b.message
    return fb
}

export function ProductForm({ product, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({ name: '', price: '', imageUrl: '', stock: '' })
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState('')
    const [quantity, setQuantity] = useState('')
    const [isSubmittingBarcode, setIsSubmittingBarcode] = useState(false)

    useEffect(() => {
        if (product) {
            setFormData({
                productId: product.productId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl || '',
                stock: '',
            })
            setImagePreview(resolveApiAssetUrl(product.imageUrl))
        } else {
            setFormData({ name: '', price: '', imageUrl: '', stock: '' })
            setImagePreview('')
        }
        setImageFile(null)
        setQuantity('')
    }, [product, isOpen])

    if (!isOpen) return null

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let imageUrl = formData.imageUrl

        // 파일 선택했으면 먼저 업로드
        if (imageFile) {
            try {
                const fd = new FormData()
                fd.append('file', imageFile)
                const res = await client.post('/api/product/image', fd, {
                    headers: { ...auth(), 'Content-Type': 'multipart/form-data' }
                })
                imageUrl = res.data
            } catch (e) {
                alert(errMsg(e, '이미지 업로드 실패'))
                return
            }
        }

        const submitData = {
            ...formData,
            imageUrl,
            price: formData.price === '' ? 0 : Number(formData.price),
            stock: formData.stock === '' ? 0 : Number(formData.stock)
        }

        try {
            if (product) {
                await client.put('/api/product', submitData, { headers: auth() })
            } else {
                await client.post('/api/product', submitData, { headers: auth() })
            }
            alert(product ? '수정 완료' : '등록 완료')
            onSave()
            onClose()
        } catch (e) {
            alert(errMsg(e, '상품 저장에 실패했습니다.'))
        }
    }

    const handleAddQr = async () => {
        if (!product?.productId) return
        if (!quantity || Number(quantity) <= 0) {
            alert('수량을 입력해주세요.')
            return
        }
        setIsSubmittingBarcode(true)
        try {
            await client.post('/api/product/barcode', {
                productId: product.productId,
                stock: Number(quantity)
            }, { headers: auth() })
            alert(`QR코드 ${quantity}개가 생성되었습니다.`)
            setQuantity('')
            onSave()
        } catch (e) {
            alert(errMsg(e, 'QR코드 생성 실패'))
        } finally {
            setIsSubmittingBarcode(false)
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h3>{product ? '상품 정보 수정' : '새 상품 등록'}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="product-form">
                    <div className="form-group">
                        <label className="write-label">상품명</label>
                        <input
                            className="write-input"
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="form-group">
                        <label className="write-label">가격 (P)</label>
                        <input
                            className="write-input"
                            type="text"
                            required
                            placeholder="가격 입력"
                            value={formData.price}
                            onChange={e => {
                                const value = e.target.value.replace(/[^0-9]/g, "")
                                setFormData({...formData, price: value})
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="write-label">상품 이미지</label>
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="미리보기"
                                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px', marginBottom: '8px' }}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="write-input"
                            onChange={handleImageChange}
                            style={{ padding: '6px' }}
                        />
                    </div>
                    {!product && (
                        <div className="form-group">
                            <label className="write-label">초기 수량</label>
                            <input
                                className="write-input"
                                type="text"
                                placeholder="수량 입력 (선택)"
                                value={formData.stock}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^0-9]/g, "")
                                    setFormData({...formData, stock: value})
                                }}
                            />
                        </div>
                    )}
                    <button type="submit" className="button button--primary button--block">
                        {product ? '정보 업데이트' : '상품 등록'}
                    </button>
                </form>

                {product && (
                    <section className="barcode-section">
                        <h4 className="barcode-title">QR코드 재고 추가</h4>
                        <div className="barcode-input-group">
                            <input
                                className="write-input"
                                type="text"
                                placeholder="수량 입력"
                                value={quantity}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^0-9]/g, "")
                                    setQuantity(value)
                                }}
                            />
                            <button
                                type="button"
                                className="button button--soft"
                                onClick={handleAddQr}
                                disabled={isSubmittingBarcode}
                            >
                                {isSubmittingBarcode ? '..' : 'QR생성'}
                            </button>
                        </div>
                        <p className="barcode-hint">입력한 수량만큼 QR코드가 자동 생성됩니다.</p>
                    </section>
                )}
            </div>
        </div>
    )
}
