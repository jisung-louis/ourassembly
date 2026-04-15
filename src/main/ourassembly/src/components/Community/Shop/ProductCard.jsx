import { resolveApiAssetUrl } from '../../../services/apiClient.js'

export function ProductCard({ product, onBuy }) {
    const imageUrl = product.imageUrl
        ? resolveApiAssetUrl(product.imageUrl)
        : null

    return (
        <div className="product-card">
            <div className="product-card__img">
                {imageUrl
                    ? <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🎁'}
            </div>
            <div style={{ flex: 1 }}>
                <h4 className="product-card__name">{product.name}</h4>
                <div className="product-card__price">{product.price?.toLocaleString()}P</div>
                {product.stock !== undefined && <div className="product-card__stock">재고 {product.stock}개</div>}
            </div>
            <button className="button button--primary" style={{ width: '100%', marginTop: 12 }} onClick={() => onBuy(product.productId, product.name)} type="button">구매하기</button>
        </div>
    )
}