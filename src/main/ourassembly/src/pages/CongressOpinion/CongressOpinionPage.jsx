export function CongressOpinionPage() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  
  const member = getMemberById(memberId)
  const [boardFilter, setBoardFilter] = useState('all')
  const [draft, setDraft] = useState({ title: '', body: '' })
  
  if (!member) return <Navigate replace to="/" />

  const submittedPost = location.state?.submission ?? null
  const posts = submittedPost ? [submittedPost, ...member.boardPosts] : member.boardPosts
  const filteredPosts = boardFilter === 'all' 
    ? posts 
    : posts.filter(p => p.status === boardFilter)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.body.trim()) return

    navigate(`/members/${member.id}/board?sent=1`, {
      replace: true,
      state: { submission: createDraftPost(draft.title.trim(), draft.body.trim()) },
    })
  }

  return (
    <SiteLayout actions={[{ to: '/', icon: 'arrowLeft', label: '검색' }]} pageClassName="page--board">
      <div className="page-container">
        {/* 1. Breadcrumb (간소화 가능) */}
        <nav className="breadcrumb">
          <Link to="/">검색</Link> <Icon name="chevronRight" />
          <Link to={`/members/${member.id}`}>{member.name}</Link> <Icon name="chevronRight" />
          <strong>소통 게시판</strong>
        </nav>

        {/* 2. Hero Section */}
        <BoardHero member={member} />

        {/* 3. Composer Section */}
        <MessageComposer 
          isSent={searchParams.get('sent') === '1'}
          draft={draft}
          setDraft={setDraft}
          onSubmit={handleSendMessage}
          onReset={() => { setDraft({ title: '', body: '' }); navigate(`/members/${member.id}/board`, { replace: true }); }}
          memberName={member.name}
        />

        {/* 4. Board Section */}
        <section className="board-section">
          <div className="board-section__head">
            <h2>소통 게시판 <span>{posts.length}건</span></h2>
            <div className="filter-row">
              {boardFilters.map(f => (
                <button 
                  key={f.id} 
                  className={`filter-chip ${boardFilter === f.id ? 'is-active' : ''}`}
                  onClick={() => setBoardFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="board-post-list">
            {filteredPosts.map(post => (
              <BoardPostCard 
                key={post.id} 
                post={post} 
                memberName={member.name} 
                defaultExpanded={searchParams.get('post') === post.id}
              />
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  )
}