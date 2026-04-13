import { useEffect, useState } from 'react';
import { getStoredAuthUser } from '../../services/auth.js';
import { fetchProducts, buyProduct } from '../../services/communityApi.js';
import { ProductCard } from '../../components/Community/Shop/ProductCard.jsx';
import { Pagination } from '../../components/Community/Main/Pagination.jsx';

const sortOpts = [
  { value: 'latest', label: '최신순' },
  { value: 'priceUp', label: '가격 높은순' },
  { value: 'priceDown', label: '가격 낮은순' },
];

export function ShopPage() {
  const currentUser = getStoredAuthUser();

  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = () => {
    setIsLoading(true);
    fetchProducts({ sort, page, size: 12 })
        .then((data) => {
          setProducts(data.content || []);
          setTotalPages(data.totalPages || 1);
        })
        .catch((e) => setError(e.message))
        .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [sort, page]);

  const handleBuy = async (productId, name) => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }
    if (!window.confirm(`${name}을(를) 구매하시겠습니까?`)) return;
    try {
      await buyProduct(productId);
      alert('구매 성공!')
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  if (isLoading && products.length === 0) {
    return (
        <div className="comm-shell">
          <div className="comm-loading">
            <div className="comm-spinner"></div>
            <p>상품 목록을 불러오는 중입니다...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="comm-shell">
        <header>
          <h1>포인트 샵</h1>
          <p className="page-desc">활동을 통해 모은 포인트로 다양한 상품을 구매하세요.</p>
        </header>

        <div className="shop-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="shop-chips">
            {sortOpts.map((o) => (
                <button
                    key={o.value}
                    className={`shop-chip ${sort === o.value ? 'is-active' : ''}`}
                    onClick={() => { setSort(o.value); setPage(1); }}
                >
                  {o.label}
                </button>
            ))}
          </div>
        </div>

        {error ? (
            <div className="comm-empty">{error}</div>
        ) : products.length === 0 ? (
            <div className="comm-empty">등록된 상품이 없습니다.</div>
        ) : (
            <>
              <div className="shop-grid">
                {products.map((p) => (
                    <ProductCard key={p.productId} product={p} onBuy={handleBuy} />
                ))}
              </div>
              <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
              />
            </>
        )}
      </div>
  );
}