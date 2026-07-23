import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Utensils, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Award, 
  ShieldCheck, 
  Coffee, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

import trufflePastaImg from '../assets/truffle_pasta.png';
import wagyuSteakImg from '../assets/wagyu_steak.png';
import chocolateLavaImg from '../assets/chocolate_lava.png';
import signatureCocktailImg from '../assets/signature_cocktail.png';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleBookingCTA = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } else {
      navigate('/login');
    }
  };

  const signatureMenu = [
    {
      id: 1,
      name: "Truffle Butter Tagliolini",
      price: "$28",
      description: "House-made fresh pasta tossed in velvety French truffle butter, finished with freshly shaved Italian black truffles and 24-month aged Parmigiano-Reggiano.",
      ingredients: "Fresh Tagliolini, Black Truffle, Parmigiano-Reggiano, Gold Leaf",
      image: trufflePastaImg,
      tags: ["Chef's Special", "Premium"]
    },
    {
      id: 2,
      name: "Miyazaki Wagyu Ribeye",
      price: "$85",
      description: "A5 grade Miyazaki Wagyu Ribeye steak pan-seared to medium-rare perfection, served with roasted confit garlic, smoked Maldon sea salt, and a rosemary infusion.",
      ingredients: "A5 Miyazaki Wagyu, Confit Garlic, Maldon Salt, Fresh Rosemary",
      image: wagyuSteakImg,
      tags: ["Signature", "Rare Cut"]
    },
    {
      id: 3,
      name: "Valrhona Chocolate Lava Cake",
      price: "$14",
      description: "Decadent warm chocolate fondant cake made with premium 70% Valrhona dark chocolate, oozing with molten fudge and served with organic Madagascar vanilla bean ice cream.",
      ingredients: "Valrhona Chocolate, Madagascar Vanilla Ice Cream, Raspberries",
      image: chocolateLavaImg,
      tags: ["Dessert", "House Favorite"]
    },
    {
      id: 4,
      name: "Smoked Rosemary Old Fashioned",
      price: "$16",
      description: "Small-batch Kentucky bourbon, Angostura bitters, and house-pressed Demerara syrup, smoked tableside with fresh burning rosemary sprigs.",
      ingredients: "Kentucky Bourbon, Demerara Syrup, Smoked Rosemary, Orange Peel",
      image: signatureCocktailImg,
      tags: ["Cocktail", "Smoked"]
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section glass-panel">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-tagline">
            <Sparkles size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Premium Fine Dining Experience
          </div>
          <h1 className="hero-title">Experience Culinary Perfection</h1>
          <p className="hero-description">
            Welcome to <strong>EateryEase</strong>, where modern sophistication meets classic gourmet excellence. Join us for a curated, reservation-only dining experience crafted by our award-winning culinary artisans.
          </p>
          <div className="hero-actions">
            <button onClick={handleBookingCTA} className="btn btn-primary">
              Book a Table
              <ChevronRight size={18} />
            </button>
            <a href="#menu" className="btn btn-outline">
              View Menu
            </a>
          </div>
        </div>
      </section>

      {/* Gourmet Menu Section */}
      <section id="menu">
        <div className="section-header">
          <span className="section-tag">Signature Gastronomy</span>
          <h2 className="section-title">Gourmet Selection</h2>
          <p className="section-subtitle">
            Explore our chef's hand-crafted signature dishes, highlighting seasonal, premium organic ingredients and creative presentations.
          </p>
        </div>

        <div className="menu-grid">
          {signatureMenu.map((item) => (
            <div key={item.id} className="menu-card glass-panel">
              <div className="menu-image-container">
                <img src={item.image} alt={item.name} className="menu-image" />
                <div className="menu-tags">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className={`menu-tag ${tag.toLowerCase().includes('special') || tag.toLowerCase().includes('signature') ? 'spicy' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="menu-info">
                <div className="menu-header">
                  <h3 className="menu-item-title">{item.name}</h3>
                  <span className="menu-price">{item.price}</span>
                </div>
                <p className="menu-desc">{item.description}</p>
                <div className="menu-ingredients">
                  <Utensils size={14} />
                  <span><strong>Ingredients:</strong> {item.ingredients}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-panel glass-panel">
        <div className="about-grid">
          <div>
            <span className="section-tag">Our Legacy</span>
            <h2 className="about-heading">The Art of Fine Seating & Taste</h2>
            <p className="about-p">
              Established with the goal of creating an intimate dining refuge, <strong>EateryEase</strong> provides a meticulously organized atmosphere where guests can celebrate flavor.
            </p>
            <p className="about-p">
              We operate exclusively through advance reservations, allowing us to source local, day-fresh organic ingredients, reduce waste, and prepare a personalized feast just for you.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-number">3</span>
                <span className="stat-label">Michelin Stars</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Private Tables</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>

          <div className="about-features">
            <div className="feature-item">
              <div className="feature-icon-box">
                <Award size={22} />
              </div>
              <div>
                <h4 className="feature-title">Exquisite Taste</h4>
                <p className="feature-desc">Every dish is a masterpieces engineered to awaken unique flavor profiles.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <Coffee size={22} />
              </div>
              <div>
                <h4 className="feature-title">Cozy Ambience</h4>
                <p className="feature-desc">Sophisticated dim lighting, lush soft acoustics, and hand-crafted oak furnishings.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="feature-title">Double-Booking Guard</h4>
                <p className="feature-desc">Our smart reservation engine ensures your assigned table is exclusively yours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Hours Section */}
      <section id="contact" className="contact-grid">
        <div className="contact-card glass-panel">
          <span className="section-tag">Reach Out</span>
          <h2 className="section-title" style={{ textAlign: 'left', fontSize: '2rem', marginBottom: '0.5rem' }}>Contact Us</h2>
          <p className="section-subtitle" style={{ textAlign: 'left', fontSize: '0.95rem' }}>
            For customized group events or specific dietary questions, reach out to our concierge service.
          </p>

          <div className="contact-info-list">
            <div className="info-item">
              <div className="info-icon-box">
                <MapPin size={20} />
              </div>
              <div>
                <div className="info-label">Address</div>
                <div className="info-value">123 Gourmet Blvd, Culinary District,<br />New York, NY 10001</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box">
                <Phone size={20} />
              </div>
              <div>
                <div className="info-label">Phone Support</div>
                <div className="info-value">+1 (555) 123-4567</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-box">
                <Mail size={20} />
              </div>
              <div>
                <div className="info-label">Email Address</div>
                <div className="info-value">reservations@eateryease.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hours-card glass-panel">
          <h3>
            <Clock size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)' }} />
            Opening Hours
          </h3>
          <div className="hours-list">
            <div className="hours-row">
              <span className="day-name">Monday</span>
              <span className="hours-time">12:00 PM - 10:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day-name">Tuesday</span>
              <span className="hours-time">12:00 PM - 10:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day-name">Wednesday</span>
              <span className="hours-time">12:00 PM - 10:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day-name">Thursday</span>
              <span className="hours-time">12:00 PM - 10:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day-name">Friday</span>
              <span className="hours-time">12:00 PM - 11:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day-name">Saturday</span>
              <span className="hours-time">11:00 AM - 11:00 PM</span>
            </div>
            <div className="hours-row">
              <span className="day-name">Sunday</span>
              <span className="hours-time">11:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
