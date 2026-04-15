import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchBoards, searchBoards } from '../../services/communityApi.js'
import { Toolbar } from '../../components/Community/Main/Toolbar.jsx'
import { FilterTags } from '../../components/Community/Main/FilterTags.jsx'
import { PopularSection } from '../../components/Community/Main/PopularSection.jsx'
import { BoardCard } from '../../components/Community/Main/BoardCard.jsx'
import { Pagination } from '../../components/Community/Main/Pagination.jsx'

export function MainPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const district = searchParams.get('district') || '전체'
  const keyword = searchParams.get('keyword') || ''
  const page = Number(searchParams.get('page') || '1')

  const [boards, setBoards] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [allBoards, setAllBoards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const isFiltered = district !== '전체' || keyword !== ''

  useEffect(() => {
    let ignore = false; setIsLoading(true); setError('')
    const dist = district === '전체' ? undefined : district
    const req = keyword
      ? searchBoards({ district: dist, keyword, page, size: 10 })
      : fetchBoards({ district: dist, sort: 'latest', page, size: 10 })
    req.then((data) => { if (!ignore) { setBoards(data.content || []); setTotalPages(data.totalPages || 1) } })
      .catch((e) => { if (!ignore) setError(e.message) })
      .finally(() => { if (!ignore) setIsLoading(false) })
    return () => { ignore = true }
  }, [district, keyword, page])

  useEffect(() => {
    if (isFiltered) return
    fetchBoards({ sort: 'latest', page: 1, size: 100 })
      .then((data) => setAllBoards(data.content || []))
      .catch(() => {})
  }, [isFiltered])

  function update(obj) {
    const next = new URLSearchParams(searchParams)
    Object.entries(obj).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k))
    setSearchParams(next)
  }

  const searchPlaceholder = district === '전체' ? '전체 게시글에서 검색' : `${district} 게시글에서 검색`

  if (isLoading) return <div className="comm-loading"><div className="comm-spinner" /><span>게시글을 불러오는 중...</span></div>

  return (
    <>
      <Toolbar district={district} onDistrictChange={(d) => update({ district: d === '전체' ? '' : d, page: '1' })}
        searchPlaceholder={searchPlaceholder} onSearch={(kw) => update({ keyword: kw || '', page: '1' })} onWrite={() => navigate('/community/write')} />
      <FilterTags district={district} keyword={keyword} totalCount={boards.length}
        onClearDistrict={() => update({ district: '', page: '1' })} onClearKeyword={() => update({ keyword: '', page: '1' })} />
      {!isFiltered && <PopularSection boards={allBoards} selectedDistrict={district} onNavigate={(id) => navigate(`/community/board/${id}`)} />}
      <div>
        {!isFiltered && <div className="comm-section-head"><h2>최신글</h2></div>}
        {error ? <div className="comm-empty">{error}</div> : boards.length === 0 ? <div className="comm-empty">{keyword ? `"${keyword}" 검색 결과가 없습니다.` : '게시글이 없습니다.'}</div> : (
          <>{boards.map((b) => <BoardCard key={b.boardId} board={b} onClick={() => navigate(`/community/board/${b.boardId}`)} />)}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => update({ page: String(p) })} /></>
        )}
      </div>
    </>
  )
}