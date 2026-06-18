const CDN = 'https://img.thebdsoft.com';

const FEATURES = [
  {
    title: '专业的设计方案',
    desc: '融合创意与实用，量身打造专属空间设计方案',
    image: `${CDN}/202507/7ac03599c211225438ece21d893508f9.png`,
  },
  {
    title: '透明的报价与流程',
    desc: '清晰详细的阶段报价，流程公开透明，无隐藏费用',
    image: `${CDN}/202507/a44328600b3ce6ed5dd1572139d14650.png`,
  },
  {
    title: '高效的项目管理',
    desc: '科学管理方法，精准把控各环节时间节点',
    image: `${CDN}/202510/f5023528dd15e51b7f00b58006db139b.jpg`,
  },
  {
    title: '严格的品质控制',
    desc: '多重审核机制，对设计细节、材料及施工质量严格把关',
    image: `${CDN}/202510/1184004662612f64d8b25ac4e90367e1.jpg`,
  },
  {
    title: '贴心的客户服务',
    desc: '专属顾问全程跟进，及时响应与专业建议',
    image: `${CDN}/202510/fd60e34815ec1022e2fb81d72026b59c.jpg`,
  },
];

export default function Features() {
  return (
    <section className="section" id="features" style={{ background: 'var(--white)' }}>
      <div className="section-header">
        <div className="section-tag">Why HDW</div>
        <h2 className="section-title">选择 HDW，您将享受到</h2>
        <p className="section-desc">
          洛杉矶专业建筑公司 HDW LLC 数十年行业积淀，为建材选购提供专业保障
        </p>
      </div>
      <div className="features-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">
              <img src={f.image} alt={f.title} loading="lazy" />
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
