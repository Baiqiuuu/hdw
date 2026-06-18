import { BRAND } from '../data/products';

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={BRAND.logo} alt="HDW LLC" />
          <p className="footer-tagline">{BRAND.tagline}</p>
          <p className="footer-desc">
            HDW LLC 是位于洛杉矶的专业建筑公司，致力于为客户提供一站式的设计与施工服务。
            公司拥有经验丰富、技术精湛的自有施工团队，擅长住宅与商业空间的室内装潢。
            在 ADU（附属居住单元）建设领域具有丰富的经验和扎实的专业能力。
          </p>
        </div>
        <div>
          <h4>商城导航</h4>
          <ul className="footer-links">
            <li><a href="#products">建材商城</a></li>
            <li><a href="#imagine">AI 样板间</a></li>
            <li><a href="#features">服务优势</a></li>
            <li><a href="https://www.hdwbuild.com/" target="_blank" rel="noopener noreferrer">HDW 官网</a></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>联系我们</h4>
          <p><strong>Duke Wang</strong></p>
          <p>{BRAND.phone}</p>
          <p>{BRAND.email}</p>
          <p>{BRAND.address}</p>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} HDW LLC. All rights reserved. · 素材来源 <a href="https://www.hdwbuild.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>hdwbuild.com</a>
      </div>
    </footer>
  );
}
