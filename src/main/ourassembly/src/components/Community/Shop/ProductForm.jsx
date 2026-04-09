import { useState, useEffect } from 'react'
import axios from 'axios'
import { getAuthorizationHeader } from '../../../services/auth.js'
import './ProductForm.css'

const BASE = 'http://localhost:8080'
const client = axios.create({ baseURL: BASE, timeout: 10000 })

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
    // 초기 상태를 0이 아닌 빈 문자열로 설정하여 '0'이 먼저 뜨는 현상 방지
    const [formData, setFormData] = useState({ name: '', price: '', imageUrl: '' })
    const [barcodeNo, setBarcodeNo] = useState('')
    const [isSubmittingBarcode, setIsSubmittingBarcode] = useState(false)

    useEffect(() => {
        if (product) {
            setFormData({
                productId: product.productId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl || '',
            })
        } else {
            // 등록 모드일 때 모든 필드를 비움
            setFormData({ name: '', price: '', imageUrl: '' })
        }
        setBarcodeNo('')
    }, [product, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        // 전송 직전에 숫자 타입으로 변환 (빈 값인 경우 0으로 처리)
        const submitData = {
            ...formData,
            price: formData.price === '' ? 0 : Number(formData.price)
        }

        try {
            if (product) {
                await client.put('/product', submitData, { headers: auth() })
            } else {
                await client.post('/product', submitData, { headers: auth() })
            }
            alert(product ? '수정 완료' : '등록 완료')
            onSave()
            onClose()
        } catch (e) {
            alert(errMsg(e, '상품 저장에 실패했습니다.'))
        }
    }

    const handleAddBarcode = async () => {
        if (!product?.productId) return
        if (!barcodeNo.trim()) return

        setIsSubmittingBarcode(true)
        try {
            await client.post('/barcode', {
                productId: product.productId,
                barcodeNo: barcodeNo.trim()
            }, { headers: auth() })

            alert('바코드가 등록되었습니다.')
            setBarcodeNo('')
            onSave()
        } catch (e) {
            alert(errMsg(e, '바코드 등록 실패'))
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
                            type="text" // number가 아닌 text로 하여 화살표 제거
                            required
                            placeholder="가격 입력"
                            value={formData.price}
                            onChange={e => {
                                // 숫자 이외의 문자 입력 방지 및 백스페이스 허용
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                setFormData({...formData, price: value});
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label className="write-label">이미지 URL</label>
                        <input
                            className="write-input"
                            value={formData.imageUrl}
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="button button--primary button--block">
                        {product ? '정보 업데이트' : '상품 등록'}
                    </button>
                </form>

                {product && (
                    <section className="barcode-section">
                        <h4 className="barcode-title">실시간 재고(바코드) 추가</h4>
                        <div className="barcode-input-group">
                            <input
                                className="write-input"
                                placeholder="바코드 번호 입력"
                                value={barcodeNo}
                                onChange={e => setBarcodeNo(e.target.value)}
                            />
                            <button
                                type="button"
                                className="button button--soft"
                                onClick={handleAddBarcode}
                                disabled={isSubmittingBarcode}
                            >
                                {isSubmittingBarcode ? '..' : '추가'}
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}