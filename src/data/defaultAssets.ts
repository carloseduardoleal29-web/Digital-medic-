import { DoctorConfig } from '../types';

// Carlos Leal · C.E. LEAL studio Official Developer Logo SVG (Transparent, crisp vector)
export const CARLOS_LEAL_DEVELOPER_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" fill="none">
  <defs>
    <linearGradient id="ceMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230284C7" />
      <stop offset="50%" stop-color="%230369A1" />
      <stop offset="100%" stop-color="%230F172A" />
    </linearGradient>
    <linearGradient id="ceArrowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="%230284C7" />
      <stop offset="50%" stop-color="%230EA5E9" />
      <stop offset="100%" stop-color="%2338BDF8" />
    </linearGradient>
  </defs>
  <g transform="translate(300, 75)">
    <path d="M-65 -35 C-95 -35 -110 -15 -110 10 C-110 35 -95 55 -65 55 C-45 55 -32 45 -25 32 L-42 22 C-46 30 -54 36 -65 36 C-80 36 -90 24 -90 10 C-90 -4 -80 -16 -65 -16 C-54 -16 -46 -10 -42 -2 L-25 -12 C-32 -25 -45 -35 -65 -35 Z" fill="url(%23ceMetalGrad)" />
    <path d="M-15 -35 L45 -35 L45 -18 L5 -18 L5 -2 L38 -2 L38 14 L5 14 L5 38 L48 38 L48 55 L-15 55 Z" fill="url(%23ceMetalGrad)" opacity="0.9" />
    <path d="M-90 18 Q-30 28 10 -5 Q35 -25 65 -45 L50 -45 L78 -58 L72 -28 L60 -40 Q30 -20 5 -2 Q-35 28 -90 18 Z" fill="url(%23ceArrowGrad)" />
  </g>
  <text x="300" y="195" text-anchor="middle" font-family="'Montserrat', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="38" fill="%230F172A" letter-spacing="4">C.E. LEAL</text>
  <text x="300" y="235" text-anchor="middle" font-family="'Montserrat', 'Helvetica Neue', Arial, sans-serif" font-weight="600" font-size="28" fill="%230284C7" letter-spacing="3">studio</text>
  <line x1="210" y1="252" x2="390" y2="252" stroke="%230284C7" stroke-width="1.5" opacity="0.6" />
  <text x="300" y="274" text-anchor="middle" font-family="'Montserrat', 'Helvetica Neue', Arial, sans-serif" font-weight="700" font-size="13" fill="%23475569" letter-spacing="3">SOFTWARE &amp; MEDICAL APPS</text>
  <text x="300" y="298" text-anchor="middle" font-family="'Montserrat', 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="12" fill="%23D97706" letter-spacing="1">Carlos Leal · Desarrollador</text>
</svg>`;

// Digital Médic Official Logo - "DIGITAL MÉDIC formatos médicos digitales" (Official App Brand Vector)
export const DIGITAL_MEDIC_OFFICIAL_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 580" fill="none">
  <defs>
    <linearGradient id="dmNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23002B49" />
      <stop offset="100%" stop-color="%23001F3F" />
    </linearGradient>
    <linearGradient id="dmGreenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="%230D7C52" />
      <stop offset="100%" stop-color="%23058257" />
    </linearGradient>
    <linearGradient id="dmTealGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="%2300A896" />
      <stop offset="100%" stop-color="%23009688" />
    </linearGradient>
  </defs>

  <!-- TOP BRAND TITLE: "DIGITAL MÉDIC" -->
  <g transform="translate(300, 110)">
    <!-- DIGITAL wordmark -->
    <text x="-270" y="0" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="72" fill="%23002B49" letter-spacing="1">DIGITAL</text>
    
    <!-- Green double wave swoosh under "DIG" -->
    <path d="M-280 12 C-250 -10, -210 25, -170 -2 C-190 18, -240 -2, -280 12 Z" fill="url(%23dmGreenGrad)" />
    <path d="M-270 20 C-245 4, -215 28, -180 8 C-195 22, -235 8, -270 20 Z" fill="%230D7C52" opacity="0.8" />

    <!-- MÉDIC wordmark -->
    <text x="30" y="0" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="72" fill="%23002B49" letter-spacing="1">MÉDIC</text>

    <!-- Green Medical Cross over/inside the letter "É" -->
    <g transform="translate(98, -26)">
      <rect x="-14" y="-14" width="28" height="28" fill="%230D7C52" rx="3" />
      <rect x="-4" y="-22" width="8" height="44" fill="%230D7C52" rx="2" />
      <rect x="-22" y="-4" width="44" height="8" fill="%230D7C52" rx="2" />
      <!-- Cross Inner Highlight -->
      <rect x="-3" y="-12" width="6" height="24" fill="%23FFFFFF" opacity="0.9" />
      <rect x="-12" y="-3" width="24" height="6" fill="%23FFFFFF" opacity="0.9" />
    </g>
  </g>

  <!-- CENTER GRAPHICS (TABLET ON LEFT, DOCTOR COAT ON RIGHT) -->
  <g transform="translate(60, 180)">
    
    <!-- LEFT ICON: DIGITAL TABLET WITH CLOUD & DOCUMENT -->
    <g transform="translate(15, 0)">
      <!-- Tablet Frame -->
      <rect x="0" y="0" width="230" height="200" rx="28" fill="%23002B49" stroke="%23001F3F" stroke-width="4" />
      <rect x="12" y="12" width="206" height="176" rx="16" fill="%23FFFFFF" />
      <circle cx="10" cy="100" r="3" fill="%2394A3B8" />
      <circle cx="220" cy="100" r="5" fill="%2394A3B8" />

      <!-- Document Icon inside Tablet -->
      <g transform="translate(62, 42)">
        <path d="M0 0 L55 0 L75 20 L75 95 L0 95 Z" fill="%230D7C52" rx="4" />
        <path d="M55 0 L55 20 L75 20 Z" fill="%23058257" />
        <!-- Horizontal Document Lines -->
        <line x1="12" y1="28" x2="48" y2="28" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round" />
        <line x1="12" y1="42" x2="62" y2="42" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round" />
        <line x1="12" y1="56" x2="62" y2="56" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round" />
        <line x1="12" y1="70" x2="62" y2="70" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round" />
        <line x1="12" y1="84" x2="48" y2="84" stroke="%23FFFFFF" stroke-width="4" stroke-linecap="round" />
      </g>

      <!-- Cloud Icon above Document with Sync Arrow -->
      <g transform="translate(100, 25)">
        <path d="M20 30 C10 30, 5 20, 12 10 C18 0, 35 -2, 42 8 C48 0, 68 2, 70 15 C78 18, 78 30, 68 30 Z" fill="%23005A9C" />
        <path d="M38 28 C28 28, 28 42, 10 42 L22 42 M10 42 L18 34" stroke="%23002B49" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </g>
    </g>

    <!-- RIGHT ICON: DOCTOR'S COAT (BATA MÉDICA) & STETHOSCOPE -->
    <g transform="translate(265, 0)">
      <!-- Coat Base Frame -->
      <rect x="0" y="0" width="160" height="200" rx="28" fill="%23002B49" stroke="%23001F3F" stroke-width="4" />
      <rect x="6" y="6" width="148" height="188" rx="22" fill="%23FFFFFF" />
      
      <!-- Inner Dark Suit V-Neck & Collar -->
      <path d="M45 6 L80 80 L115 6 Z" fill="%23001F3F" />
      <path d="M70 6 L80 30 L90 6 Z" fill="%23002B49" />
      
      <!-- Coat Lapels (Solapas de la Bata) -->
      <path d="M20 6 L55 90 L6 110 Z" fill="%23F8FAFC" stroke="%23002B49" stroke-width="4" />
      <path d="M140 6 L105 90 L154 110 Z" fill="%23F8FAFC" stroke="%23002B49" stroke-width="4" />
      <line x1="80" y1="80" x2="80" y2="194" stroke="%23002B49" stroke-width="4" />
      
      <!-- Pocket & Buttons -->
      <rect x="100" y="130" width="40" height="40" fill="%23F1F5F9" stroke="%23002B49" stroke-width="3" rx="4" />
      <circle cx="72" cy="115" r="3" fill="%2394A3B8" />

      <!-- Stethoscope hanging over neck -->
      <path d="M35 20 C20 60, 25 120, 50 120 C70 120, 68 90, 60 70" stroke="%23002B49" stroke-width="6" fill="none" stroke-linecap="round" />
      <circle cx="50" cy="120" r="12" fill="%230D7C52" stroke="%23002B49" stroke-width="4" />
      <circle cx="128" cy="70" r="9" fill="%23002B49" />
    </g>

  </g>

  <!-- BOTTOM SUBTITLE: "formatos médicos digitales" -->
  <g transform="translate(300, 450)" text-anchor="middle">
    <text x="0" y="0" font-family="'Arial Rounded MT Bold', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="46" fill="%2300A896" letter-spacing="-0.5">formatos médicos</text>
    <text x="0" y="52" font-family="'Arial Rounded MT Bold', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="48" fill="%2300A896" letter-spacing="-0.5">digitales</text>
  </g>
</svg>`;

export const CARLOS_LEAL_DEVELOPER_BADGE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="ceMetalGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%230284C7" />
      <stop offset="50%" stop-color="%230369A1" />
      <stop offset="100%" stop-color="%230F172A" />
    </linearGradient>
    <linearGradient id="ceArrowGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="%230284C7" />
      <stop offset="100%" stop-color="%2338BDF8" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" x="4" y="4" rx="28" fill="%23F8FAFC" stroke="%230284C7" stroke-width="3"/>
  <g transform="translate(100, 65)">
    <path d="M-40 -20 C-60 -20 -70 -8 -70 8 C-70 24 -60 36 -40 36 C-28 36 -20 30 -15 20 L-26 14 C-29 19 -34 23 -40 23 C-50 23 -56 15 -56 8 C-56 -1 -50 -9 -40 -9 C-34 -9 -29 -5 -26 0 L-15 -6 C-20 -15 -28 -20 -40 -20 Z" fill="url(%23ceMetalGrad2)" />
    <path d="M-8 -20 L30 -20 L30 -9 L5 -9 L5 1 L25 1 L25 11 L5 11 L5 25 L32 25 L32 36 L-8 36 Z" fill="url(%23ceMetalGrad2)" opacity="0.9" />
    <path d="M-55 10 Q-18 18 8 -2 Q24 -15 44 -28 L34 -28 L54 -36 L50 -16 L42 -24 Q20 -12 2 -1 Q-22 18 -55 10 Z" fill="url(%23ceArrowGrad2)" />
  </g>
  <text x="100" y="140" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="900" font-size="20" fill="%230F172A" letter-spacing="2">C.E. LEAL</text>
  <text x="100" y="162" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="600" font-size="14" fill="%230284C7" letter-spacing="1">studio</text>
  <text x="100" y="182" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="800" font-size="8" fill="%23D97706" letter-spacing="1">CARLOS LEAL DESARROLLADOR</text>
</svg>`;

export const MEDICINE_EMBLEM_ESCULAPIO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="88" fill="%23eff6ff" stroke="%231e3a8a" stroke-width="6"/>
  <circle cx="100" cy="100" r="78" stroke="%232563eb" stroke-width="2" stroke-dasharray="6 3"/>
  <!-- Official Rod of Asclepius / Vara de Esculapio ⚕️ -->
  <line x1="100" y1="28" x2="100" y2="172" stroke="%231e3a8a" stroke-width="7" stroke-linecap="round"/>
  <circle cx="100" cy="28" r="8" fill="%232563eb"/>
  <!-- Snake coiled around the rod -->
  <path d="M84 48 C124 48, 124 72, 100 82 C76 92, 76 116, 116 126 C124 128, 112 152, 92 156" stroke="%232563eb" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="86" cy="48" r="4" fill="%231d4ed8"/>
  <text x="100" y="185" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="%231e3a8a" letter-spacing="1">MEDICINA ⚕️</text>
</svg>`;

// Ultra-Modern Tech-Medical Logo - Minimalist, high-end healthcare gradient
export const MODERN_MEDICAL_LOGO_SVG = DIGITAL_MEDIC_OFFICIAL_LOGO_SVG;

export const CADUCEUS_SVG = MODERN_MEDICAL_LOGO_SVG;

// Medical Shield Cross
export const MEDICAL_SHIELD_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <path d="M100 20 L165 48 C165 115, 135 158, 100 180 C65 158, 35 115, 35 48 Z" fill="%23eff6ff" stroke="%231d4ed8" stroke-width="6"/>
  <!-- Cross in center -->
  <rect x="88" y="60" width="24" height="75" rx="4" fill="%232563eb"/>
  <rect x="62.5" y="85.5" width="75" height="24" rx="4" fill="%232563eb"/>
  <circle cx="100" cy="97.5" r="7" fill="%23ffffff"/>
</svg>`;

// Hospital & Clinic Logo
export const HOSPITAL_EMBLEM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="85" fill="%23f0fdf4" stroke="%23059669" stroke-width="6"/>
  <path d="M50 140 L50 80 L100 45 L150 80 L150 140 Z" fill="%23ffffff" stroke="%23059669" stroke-width="4"/>
  <rect x="90" y="70" width="20" height="45" rx="3" fill="%2310b981"/>
  <rect x="77.5" y="82.5" width="45" height="20" rx="3" fill="%2310b981"/>
  <path d="M60 140 L140 140" stroke="%23059669" stroke-width="5" stroke-linecap="round"/>
</svg>`;

// Stethoscope & Heart Logo
export const STETHOSCOPE_HEART_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="85" fill="%23fff1f2" stroke="%23e11d48" stroke-width="5"/>
  <path d="M100 145 C60 115 45 90 45 70 C45 52 58 40 75 40 C86 40 95 46 100 55 C105 46 114 40 125 40 C142 40 155 52 155 70 C155 90 140 115 100 145 Z" fill="%23e11d48" opacity="0.85"/>
  <path d="M70 95 L85 95 L93 80 L107 115 L116 90 L124 98 L135 95" stroke="%23ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Swiss Medical Cross Logo
export const SWISS_CROSS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect x="20" y="20" width="160" height="160" rx="44" fill="%230284c7" />
  <rect x="85" y="48" width="30" height="104" rx="10" fill="%23ffffff" />
  <rect x="48" y="85" width="104" height="30" rx="10" fill="%23ffffff" />
  <circle cx="100" cy="100" r="72" stroke="%23ffffff" stroke-opacity="0.3" stroke-width="3" stroke-dasharray="8 6"/>
</svg>`;

// Prescription Rp / Rx Logo
export const RX_PRESCRIPTION_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="86" fill="%23f8fafc" stroke="%232563eb" stroke-width="6"/>
  <text x="76" y="128" font-family="'Times New Roman', serif" font-weight="bold" font-style="italic" font-size="96" fill="%231e3a8a">R</text>
  <path d="M118 102 L148 136" stroke="%232563eb" stroke-width="12" stroke-linecap="round"/>
  <path d="M144 112 L122 134" stroke="%232563eb" stroke-width="10" stroke-linecap="round"/>
  <circle cx="140" cy="62" r="10" fill="%2306b6d4"/>
</svg>`;

// Dental Odontology Logo
export const DENTAL_EMBLEM_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect x="20" y="20" width="160" height="160" rx="40" fill="%23f0fdfa" stroke="%230d9488" stroke-width="5"/>
  <path d="M72 65 C60 75 52 100 62 135 C68 152 78 155 84 135 C88 120 95 120 100 120 C105 120 112 120 116 135 C122 155 132 152 138 135 C148 100 140 75 128 65 C116 55 84 55 72 65 Z" fill="%230d9488"/>
  <circle cx="100" cy="85" r="12" fill="%23ffffff" opacity="0.9"/>
  <path d="M100 78 L100 92 M93 85 L107 85" stroke="%230d9488" stroke-width="3" stroke-linecap="round"/>
</svg>`;

// Cardiology Heart Pulse Logo
export const CARDIOLOGY_PULSE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="88" fill="%23fee2e2" stroke="%23dc2626" stroke-width="5"/>
  <path d="M42 104 L70 104 L82 72 L96 138 L112 84 L122 116 L132 98 L142 104 L160 104" stroke="%23b91c1c" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="96" cy="138" r="4.5" fill="%23ef4444"/>
</svg>`;

// 1. Ginecología y Obstetricia - Mujer Embarazada (Silueta de Maternidad y Bebé)
export const OBSTETRICS_PREGNANCY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23fdf2f8" stroke="%23db2777" stroke-width="4"/>
  <circle cx="90" cy="50" r="16" fill="%23db2777"/>
  <path d="M84 66 C68 84 66 114 70 144 C72 150 78 152 82 148 C88 140 92 125 90 110 C88 95 95 80 102 72 Z" fill="%23db2777"/>
  <path d="M96 74 C90 92 88 108 96 126 C102 136 116 138 128 132 C134 128 135 120 128 118 C118 116 108 114 105 102 C102 92 105 82 108 72 Z" fill="%23ec4899"/>
  <path d="M102 82 C120 86 138 98 140 118 C142 138 128 152 108 155 C96 157 88 150 90 144 C92 138 105 142 116 138 C126 134 130 124 126 114 C122 102 110 92 98 88 Z" fill="%23be185d"/>
  <path d="M118 115 C115 110 110 112 110 115 C110 119 118 124 118 124 C118 124 126 119 126 115 C126 112 121 110 118 115 Z" fill="%23f43f5e"/>
</svg>`;

// 2. Anestesiología - Laringoscopio Quirúrgico y Monitor
export const ANESTHESIOLOGY_LARYNGOSCOPE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f0f9ff" stroke="%230284c7" stroke-width="4"/>
  <rect x="52" y="70" width="26" height="88" rx="6" fill="%230369a1" stroke="%23075985" stroke-width="2"/>
  <line x1="55" y1="84" x2="75" y2="84" stroke="%2338bdf8" stroke-width="2"/>
  <line x1="55" y1="98" x2="75" y2="98" stroke="%2338bdf8" stroke-width="2"/>
  <line x1="55" y1="112" x2="75" y2="112" stroke="%2338bdf8" stroke-width="2"/>
  <line x1="55" y1="126" x2="75" y2="126" stroke="%2338bdf8" stroke-width="2"/>
  <line x1="55" y1="140" x2="75" y2="140" stroke="%2338bdf8" stroke-width="2"/>
  <path d="M60 70 L60 52 C60 48 68 45 74 48 L82 54 L80 70 Z" fill="%230284c7"/>
  <path d="M76 50 C95 48 125 52 145 68 C158 79 164 92 165 98 C166 102 160 104 156 100 C148 92 138 82 118 76 C98 70 82 72 74 74 Z" fill="%230284c7" stroke="%230369a1" stroke-width="2"/>
  <circle cx="163" cy="99" r="4.5" fill="%23facc15"/>
  <path d="M165 99 L178 95 M165 102 L176 108 M165 98 L175 90" stroke="%23facc15" stroke-width="2" stroke-linecap="round"/>
  <path d="M40 168 L70 168 L80 156 L90 176 L100 164 L108 168 L160 168" stroke="%230ea5e9" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// 3. Pediatría y Puericultura - Huella de Bebé y Afecto
export const PEDIATRICS_BABY_FOOTPRINT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f0fdf4" stroke="%2316a34a" stroke-width="4"/>
  <path d="M92 90 C78 96 70 115 74 135 C78 152 92 162 104 162 C116 162 124 150 122 135 C120 120 108 108 108 98 C108 92 102 86 92 90 Z" fill="%2316a34a"/>
  <circle cx="82" cy="74" r="10" fill="%2316a34a"/>
  <circle cx="98" cy="70" r="6.5" fill="%2316a34a"/>
  <circle cx="110" cy="74" r="5.5" fill="%2316a34a"/>
  <circle cx="120" cy="80" r="4.5" fill="%2316a34a"/>
  <circle cx="128" cy="88" r="3.5" fill="%2316a34a"/>
  <path d="M142 48 C138 42 130 44 130 48 C130 54 142 62 142 62 C142 62 154 54 154 48 C154 44 146 42 142 48 Z" fill="%23f43f5e"/>
</svg>`;

// 4. Traumatología y Ortopedia - Estructura Ósea y Columna
export const TRAUMATOLOGY_BONE_SPINE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f8fafc" stroke="%233b82f6" stroke-width="4"/>
  <circle cx="84" cy="52" r="14" fill="%232563eb"/>
  <circle cx="116" cy="52" r="14" fill="%232563eb"/>
  <path d="M88 56 C94 80 94 120 88 144 L112 144 C106 120 106 80 112 56 Z" fill="%231d4ed8"/>
  <circle cx="84" cy="148" r="14" fill="%232563eb"/>
  <circle cx="116" cy="148" r="14" fill="%232563eb"/>
  <rect x="74" y="94" width="52" height="12" rx="4" fill="%2393c5fd" opacity="0.8"/>
  <circle cx="100" cy="100" r="4" fill="%23ffffff"/>
</svg>`;

// 5. Neumonología y Respiratorio - Pulmones y Árbol Bronquial
export const PULMONOLOGY_LUNGS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23ecfeff" stroke="%230891b2" stroke-width="4"/>
  <path d="M100 42 L100 82 M94 48 L106 48 M94 58 L106 58 M94 68 L106 68 M94 78 L106 78" stroke="%230e7490" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 82 C94 92 84 98 72 104 M100 82 C106 92 116 98 128 104" stroke="%230e7490" stroke-width="4" stroke-linecap="round"/>
  <path d="M68 85 C52 92 45 110 46 132 C47 148 55 160 74 158 C85 156 90 144 88 130 C86 112 84 96 72 88 Z" fill="%2306b6d4" opacity="0.9"/>
  <path d="M132 85 C148 92 155 110 154 132 C153 148 145 160 126 158 C118 157 114 148 116 138 C118 128 112 118 112 108 C112 96 122 88 132 85 Z" fill="%2306b6d4" opacity="0.9"/>
  <path d="M70 105 L60 120 M70 105 L74 125 M130 105 L140 120 M130 105 L126 125" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

// 6. Neurología y Neurocirugía - Cerebro y Conexiones Sinápticas
export const NEUROLOGY_BRAIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23faf5ff" stroke="%237c3aed" stroke-width="4"/>
  <path d="M96 50 C80 50 68 58 60 70 C50 82 50 98 56 108 C50 118 52 134 62 144 C72 154 86 154 96 152 Z" fill="%238b5cf6"/>
  <path d="M104 50 C120 50 132 58 140 70 C150 82 150 98 144 108 C150 118 148 134 138 144 C128 154 114 154 104 152 Z" fill="%237c3aed"/>
  <circle cx="76" cy="80" r="4" fill="%23ffffff"/>
  <circle cx="68" cy="112" r="4" fill="%23ffffff"/>
  <circle cx="84" cy="132" r="4" fill="%23ffffff"/>
  <circle cx="124" cy="80" r="4" fill="%23ffffff"/>
  <circle cx="132" cy="112" r="4" fill="%23ffffff"/>
  <circle cx="116" cy="132" r="4" fill="%23ffffff"/>
  <path d="M76 80 L68 112 L84 132 M124 80 L132 112 L116 132 M76 80 L100 95 L124 80 M68 112 L100 115 L132 112" stroke="%23ddd6fe" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// 7. Oftalmología y Optometría - Ojo Clínico y Visión
export const OPHTHALMOLOGY_EYE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f0f9ff" stroke="%230284c7" stroke-width="4"/>
  <path d="M36 100 C56 68 144 68 164 100 C144 132 56 132 36 100 Z" fill="%23ffffff" stroke="%230284c7" stroke-width="5" stroke-linejoin="round"/>
  <circle cx="100" cy="100" r="28" fill="%230ea5e9" stroke="%230369a1" stroke-width="3"/>
  <circle cx="100" cy="100" r="14" fill="%230f172a"/>
  <circle cx="94" cy="94" r="5" fill="%23ffffff"/>
  <circle cx="106" cy="104" r="2.5" fill="%23ffffff"/>
</svg>`;

// 8. Gastroenterología - Sistema Digestivo y Estómago
export const GASTROENTEROLOGY_STOMACH_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23fff7ed" stroke="%23ea580c" stroke-width="4"/>
  <path d="M85 45 C86 60 92 68 98 75" stroke="%23c2410c" stroke-width="8" stroke-linecap="round"/>
  <path d="M96 72 C115 65 145 74 148 105 C152 135 130 158 105 158 C80 158 64 142 66 122 C68 102 85 92 98 88 Z" fill="%23f97316"/>
  <path d="M125 80 C140 90 142 120 132 140" stroke="%23fff7ed" stroke-width="4" stroke-linecap="round"/>
  <path d="M68 128 C56 132 52 144 58 152" stroke="%23c2410c" stroke-width="6" stroke-linecap="round"/>
</svg>`;

// 9. Cirugía General - Bisturí Quirúrgico de Precisión
export const SURGERY_SCALPEL_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f0fdf4" stroke="%23059669" stroke-width="4"/>
  <g transform="rotate(-45 100 100)">
    <rect x="94" y="30" width="12" height="90" rx="3" fill="%23047857" stroke="%23064e3b" stroke-width="1.5"/>
    <line x1="97" y1="45" x2="103" y2="45" stroke="%236ee7b7" stroke-width="2"/>
    <line x1="97" y1="60" x2="103" y2="60" stroke="%236ee7b7" stroke-width="2"/>
    <line x1="97" y1="75" x2="103" y2="75" stroke="%236ee7b7" stroke-width="2"/>
    <line x1="97" y1="90" x2="103" y2="90" stroke="%236ee7b7" stroke-width="2"/>
    <path d="M96 120 L104 120 L105 130 L95 130 Z" fill="%236ee7b7"/>
    <path d="M97 130 L103 130 L103 155 C103 168 96 172 94 172 C94 172 95 150 97 130 Z" fill="%23e2e8f0" stroke="%230f172a" stroke-width="1.5"/>
  </g>
  <circle cx="100" cy="100" r="68" stroke="%2310b981" stroke-width="2" stroke-dasharray="8 6"/>
</svg>`;

// 10. Nefrología y Urología - Riñón Anatómico
export const NEPHROLOGY_KIDNEY_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23fff1f2" stroke="%23e11d48" stroke-width="4"/>
  <path d="M98 48 C128 48 148 70 148 100 C148 130 128 152 98 152 C72 152 56 138 56 120 C56 106 68 104 74 100 C68 96 56 94 56 80 C56 62 72 48 98 48 Z" fill="%23be123c"/>
  <path d="M72 100 C85 96 95 100 95 104 C95 108 85 110 74 106" fill="%23fda4af"/>
  <path d="M72 104 C64 112 62 135 58 160" stroke="%23e11d48" stroke-width="5" stroke-linecap="round"/>
</svg>`;

// 11. Dermatología - Lupa y Células Cutáneas
export const DERMATOLOGY_SKIN_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23fff1f2" stroke="%23f43f5e" stroke-width="4"/>
  <circle cx="90" cy="90" r="42" fill="%23ffffff" stroke="%23e11d48" stroke-width="5"/>
  <path d="M120 120 L155 155" stroke="%23be123c" stroke-width="12" stroke-linecap="round"/>
  <path d="M90 62 C85 75 80 82 90 90 C100 82 95 75 90 62 Z" fill="%23fb7185"/>
  <path d="M90 118 C85 105 80 98 90 90 C100 98 95 105 90 118 Z" fill="%23fb7185"/>
  <path d="M62 90 C75 85 82 80 90 90 C82 100 75 95 62 90 Z" fill="%23fb7185"/>
  <path d="M118 90 C105 85 98 80 90 90 C98 100 105 95 118 90 Z" fill="%23fb7185"/>
  <circle cx="90" cy="90" r="5" fill="%23e11d48"/>
</svg>`;

// 12. Otorrinolaringología - Oído y Sonido
export const OTORHINOLARYNGOLOGY_ENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f0fdfa" stroke="%230d9488" stroke-width="4"/>
  <path d="M92 50 C118 50 135 68 135 90 C135 110 122 120 118 128 C114 136 116 148 106 150 C96 152 92 142 94 134 C98 122 115 114 115 94 C115 80 104 68 90 68 C80 68 76 74 74 80" stroke="%230f766e" stroke-width="7" stroke-linecap="round"/>
  <path d="M96 90 C104 90 108 96 106 104 C104 110 98 112 94 108" stroke="%2314b8a6" stroke-width="5" stroke-linecap="round"/>
  <path d="M142 80 C148 86 148 94 142 100 M152 72 C162 82 162 98 152 108" stroke="%230d9488" stroke-width="4" stroke-linecap="round"/>
</svg>`;

// 13. Emergenciología - Estrella de la Vida Oficial
export const EMERGENCY_STAR_OF_LIFE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23eff6ff" stroke="%231d4ed8" stroke-width="4"/>
  <g fill="%232563eb">
    <rect x="88" y="35" width="24" height="130" rx="4"/>
    <rect x="88" y="35" width="24" height="130" rx="4" transform="rotate(60 100 100)"/>
    <rect x="88" y="35" width="24" height="130" rx="4" transform="rotate(-60 100 100)"/>
  </g>
  <line x1="100" y1="48" x2="100" y2="152" stroke="%23ffffff" stroke-width="5" stroke-linecap="round"/>
  <path d="M94 65 C108 68 108 78 94 82 C82 86 86 100 102 102 C116 104 114 118 98 120 C86 122 90 134 102 136" stroke="%23ffffff" stroke-width="4.5" fill="none" stroke-linecap="round"/>
</svg>`;

// 14. Psicología - Símbolo Griego Psi (Ψ)
export const PSYCHOLOGY_PSI_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23faf5ff" stroke="%239333ea" stroke-width="4"/>
  <line x1="100" y1="42" x2="100" y2="158" stroke="%237e22ce" stroke-width="8" stroke-linecap="round"/>
  <path d="M58 72 C58 116 78 132 100 132 C122 132 142 116 142 72" stroke="%237e22ce" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="58" cy="70" r="6" fill="%23a855f7"/>
  <circle cx="142" cy="70" r="6" fill="%23a855f7"/>
  <circle cx="100" cy="42" r="6" fill="%23a855f7"/>
</svg>`;

// 15. Bioanálisis y Laboratorio - Microscopio Clínico
export const BIOANALYSIS_LAB_MICROSCOPE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f8fafc" stroke="%231e3a8a" stroke-width="4"/>
  <rect x="58" y="152" width="84" height="12" rx="4" fill="%231e3a8a"/>
  <path d="M72 152 C72 110 88 85 106 82 L106 100 C96 102 88 120 88 152 Z" fill="%231e40af"/>
  <g transform="rotate(-25 110 85)">
    <rect x="100" y="40" width="20" height="52" rx="3" fill="%233b82f6"/>
    <rect x="96" y="32" width="28" height="10" rx="2" fill="%231d4ed8"/>
    <path d="M96 92 L124 92 L116 106 L104 106 Z" fill="%231e3a8a"/>
    <rect x="106" y="106" width="8" height="12" fill="%2364748b"/>
  </g>
  <rect x="94" y="122" width="48" height="6" rx="2" fill="%230f172a"/>
  <circle cx="118" cy="120" r="3" fill="%23ef4444"/>
</svg>`;

// 16. Nutrición y Dietética - Manzana Saludable
export const NUTRITION_DIETETICS_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23f0fdf4" stroke="%2316a34a" stroke-width="4"/>
  <path d="M100 68 C88 56 65 58 55 75 C42 98 48 135 68 152 C80 162 92 158 100 154 C108 158 120 162 132 152 C152 135 158 98 145 75 C135 58 112 56 100 68 Z" fill="%2322c55e"/>
  <path d="M100 68 C102 52 108 45 114 42" stroke="%2378350f" stroke-width="4" stroke-linecap="round"/>
  <path d="M106 52 C120 48 130 54 132 60 C122 66 112 60 106 52 Z" fill="%2315803d"/>
  <path d="M62 110 C82 130 118 130 138 110" stroke="%23ffffff" stroke-width="5" stroke-dasharray="4 3" stroke-linecap="round"/>
</svg>`;

// 17. Fisioterapia y Rehabilitación - Movilidad y Bienestar
export const PHYSIOTHERAPY_MOVEMENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23fffbeb" stroke="%23d97706" stroke-width="4"/>
  <circle cx="100" cy="54" r="14" fill="%23d97706"/>
  <path d="M100 70 C106 88 110 108 102 128" stroke="%23b45309" stroke-width="9" stroke-linecap="round"/>
  <path d="M60 82 C80 72 120 72 140 82" stroke="%23f59e0b" stroke-width="7" stroke-linecap="round"/>
  <path d="M102 128 L82 162 M102 128 L124 158" stroke="%23b45309" stroke-width="8" stroke-linecap="round"/>
  <path d="M48 100 C68 140 132 140 152 100" stroke="%23fbbf24" stroke-width="4" stroke-dasharray="6 4" stroke-linecap="round"/>
</svg>`;

// 18. Endocrinología - Tiroides y Metabolismo
export const ENDOCRINOLOGY_THYROID_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="90" fill="%23faf5ff" stroke="%239333ea" stroke-width="4"/>
  <rect x="92" y="45" width="16" height="110" rx="3" fill="%23e9d5ff"/>
  <line x1="92" y1="60" x2="108" y2="60" stroke="%23c084fc" stroke-width="2.5"/>
  <line x1="92" y1="75" x2="108" y2="75" stroke="%23c084fc" stroke-width="2.5"/>
  <line x1="92" y1="90" x2="108" y2="90" stroke="%23c084fc" stroke-width="2.5"/>
  <line x1="92" y1="105" x2="108" y2="105" stroke="%23c084fc" stroke-width="2.5"/>
  <line x1="92" y1="120" x2="108" y2="120" stroke="%23c084fc" stroke-width="2.5"/>
  <path d="M96 90 C85 70 65 72 58 95 C52 118 64 142 85 138 C94 136 96 122 96 108 Z" fill="%23a855f7"/>
  <path d="M104 90 C115 70 135 72 142 95 C148 118 136 142 115 138 C106 136 104 122 104 108 Z" fill="%239333ea"/>
  <rect x="88" y="106" width="24" height="14" rx="4" fill="%237e22ce"/>
</svg>`;

// Basic Medical Logos Registry
export interface BasicMedicalLogo {
  id: string;
  name: string;
  category: string;
  svgDataUri: string;
}

export const BASIC_MEDICAL_LOGOS: BasicMedicalLogo[] = [
  // Apps & Emblemas Oficiales
  { id: 'digital-medic', name: 'Digital Médic (Oficial)', category: 'App Oficial', svgDataUri: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG },
  { id: 'esculapio-medicina', name: 'Símbolo Medicina ⚕️', category: 'Oficial ⚕️', svgDataUri: MEDICINE_EMBLEM_ESCULAPIO_SVG },
  { id: 'caduceo', name: 'Caduceo y Esculapio', category: 'Médico General', svgDataUri: MODERN_MEDICAL_LOGO_SVG },
  { id: 'escudo', name: 'Escudo Cruz Médica', category: 'Médico General', svgDataUri: MEDICAL_SHIELD_SVG },
  { id: 'cruz-suiza', name: 'Cruz Médica Clásica', category: 'Salud / Clínica', svgDataUri: SWISS_CROSS_SVG },
  { id: 'hospital', name: 'Centro Clínico / Hospital', category: 'Institucional', svgDataUri: HOSPITAL_EMBLEM_SVG },
  { id: 'estetoscopio', name: 'Estetoscopio y Corazón', category: 'Cardio / Clínico', svgDataUri: STETHOSCOPE_HEART_SVG },
  { id: 'rx', name: 'Prescripción Médica Rp', category: 'Recetario / Farmacia', svgDataUri: RX_PRESCRIPTION_SVG },
  
  // Especialidades Solicitadas por el Doctor
  { id: 'obstetricia-embarazo', name: 'Obstetricia y Ginecología (Mujer Embarazada)', category: 'Ginecología y Obstetricia', svgDataUri: OBSTETRICS_PREGNANCY_SVG },
  { id: 'anestesiologia-laringo', name: 'Anestesiología (Laringoscopio y Vía Aérea)', category: 'Anestesiología', svgDataUri: ANESTHESIOLOGY_LARYNGOSCOPE_SVG },
  { id: 'pediatria-pie', name: 'Pediatría (Huella Bebé y Cuidado)', category: 'Pediatría', svgDataUri: PEDIATRICS_BABY_FOOTPRINT_SVG },
  { id: 'cardio-pulso', name: 'Cardiología (Electrocardiograma y Pulso)', category: 'Cardiología', svgDataUri: CARDIOLOGY_PULSE_SVG },
  { id: 'traumatologia-hueso', name: 'Traumatología y Ortopedia (Hueso y Columna)', category: 'Traumatología', svgDataUri: TRAUMATOLOGY_BONE_SPINE_SVG },
  { id: 'neumonologia-pulmones', name: 'Neumonología (Pulmones y Árbol Bronquial)', category: 'Neumonología', svgDataUri: PULMONOLOGY_LUNGS_SVG },
  { id: 'cirugia-bisturi', name: 'Cirugía General (Bisturí Quirúrgico)', category: 'Cirugía General', svgDataUri: SURGERY_SCALPEL_SVG },
  { id: 'neurologia-cerebro', name: 'Neurología y Salud Mental (Cerebro y Sinapsis)', category: 'Neurología', svgDataUri: NEUROLOGY_BRAIN_SVG },
  { id: 'oftalmologia-ojo', name: 'Oftalmología (Ojo Clínico y Visión)', category: 'Oftalmología', svgDataUri: OPHTHALMOLOGY_EYE_SVG },
  { id: 'gastro-estomago', name: 'Gastroenterología (Estómago y Digestivo)', category: 'Gastroenterología', svgDataUri: GASTROENTEROLOGY_STOMACH_SVG },
  { id: 'nefrologia-rinon', name: 'Nefrología y Urología (Riñón)', category: 'Nefrología / Urología', svgDataUri: NEPHROLOGY_KIDNEY_SVG },
  { id: 'dermatologia-piel', name: 'Dermatología (Dermatoscopio y Piel)', category: 'Dermatología', svgDataUri: DERMATOLOGY_SKIN_SVG },
  { id: 'otorrino-oido', name: 'Otorrinolaringología (Oído y Audición)', category: 'Otorrinolaringología', svgDataUri: OTORHINOLARYNGOLOGY_ENT_SVG },
  { id: 'emergencias-estrella', name: 'Emergenciología (Estrella de la Vida)', category: 'Emergenciología', svgDataUri: EMERGENCY_STAR_OF_LIFE_SVG },
  { id: 'psicologia-psi', name: 'Psicología (Símbolo Griego Psi Ψ)', category: 'Psicología', svgDataUri: PSYCHOLOGY_PSI_SVG },
  { id: 'dental-diente', name: 'Odontología y Dental (Muela Saludable)', category: 'Odontología', svgDataUri: DENTAL_EMBLEM_SVG },
  { id: 'laboratorio-microscopio', name: 'Bioanálisis y Laboratorio (Microscopio)', category: 'Laboratorio Clínico', svgDataUri: BIOANALYSIS_LAB_MICROSCOPE_SVG },
  { id: 'nutricion-manzana', name: 'Nutrición y Dietética (Manzana Saludable)', category: 'Nutrición', svgDataUri: NUTRITION_DIETETICS_SVG },
  { id: 'fisioterapia-movimiento', name: 'Fisioterapia y Rehabilitación (Movimiento)', category: 'Fisioterapia', svgDataUri: PHYSIOTHERAPY_MOVEMENT_SVG },
  { id: 'endocrino-tiroides', name: 'Endocrinología (Tiroides y Metabolismo)', category: 'Endocrinología', svgDataUri: ENDOCRINOLOGY_THYROID_SVG }
];

// Helper to get medical symbols flanking the doctor's name
export function getMedicalSymbolSVG(type: string = 'esculapio', color: string = '#2563eb'): string {
  const encColor = encodeURIComponent(color);

  if (type === 'cruz') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encColor}"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/></svg>`;
  }

  if (type === 'estetoscopio') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3v6a6 6 0 0 0 12 0V3"/><path d="M10.5 15a6 6 0 0 0 6 6h1a2 2 0 0 0 2-2v-3"/><circle cx="19.5" cy="16" r="2"/></svg>`;
  }

  if (type === 'pulso') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${encColor}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`;
  }

  if (type === 'rx') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h6a4 4 0 0 1 0 8H5V4z"/><path d="M9 12l7 8"/><path d="M12 18l5-4"/></svg>`;
  }

  if (type === 'caduceo') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${encColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="2" r="1.5" fill="${encColor}"/><path d="M7 6c5-2 5 4 0 6 5 2 5 8 0 6"/><path d="M17 6c-5-2-5 4 0 6-5 2-5 8 0 6"/></svg>`;
  }

  // Default: Esculapio (Rod of Asclepius - single snake coiled around staff, official medical symbol)
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${encColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" stroke-width="2.5"/>
    <circle cx="12" cy="2.5" r="1.5" fill="${encColor}"/>
    <path d="M10 5.5 C15 5.5, 15 8, 12 9 C9 10, 9 13, 13 14 C16 15, 14 18.5, 11 19" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
}

// Default Doctor Stamp & Signature SVG
export type DoctorStampStyle = 'rectangular' | 'oval' | 'circular' | 'con-firma';

export function createDoctorStampSVG(
  doctorName: string, 
  mpps: string, 
  ci: string, 
  color: string = '#1e3a8a',
  specialty: string = 'MÉDICO CIRUJANO · ESPECIALISTA',
  style: DoctorStampStyle = 'rectangular',
  collegeNumber: string = ''
): string {
  const encColor = encodeURIComponent(color);
  const cleanName = doctorName ? doctorName.toUpperCase() : 'DR. MÉDICO TRATANTE';
  const cleanSpec = specialty ? specialty.toUpperCase() : 'ESPECIALISTA';
  const cleanCollege = collegeNumber ? ` · ${collegeNumber}` : '';

  if (style === 'oval') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 130" fill="none">
      <!-- Oval Outer & Inner -->
      <ellipse cx="125" cy="65" rx="118" ry="58" stroke="${encColor}" stroke-width="3" opacity="0.85"/>
      <ellipse cx="125" cy="65" rx="112" ry="52" stroke="${encColor}" stroke-width="1.2" stroke-dasharray="4 2" opacity="0.75"/>
      
      <!-- Doctor Name -->
      <text x="125" y="42" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="${encColor}" letter-spacing="0.5">
        ${cleanName}
      </text>
      
      <!-- Specialty -->
      <text x="125" y="58" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="8.5" fill="${encColor}">
        ${cleanSpec.length > 34 ? cleanSpec.substring(0, 34) + '...' : cleanSpec}
      </text>
      
      <!-- MPPS & CI -->
      <text x="125" y="74" text-anchor="middle" font-family="sans-serif" font-size="8" fill="${encColor}">
        M.P.P.S: ${mpps || '00.000'} · C.I: ${ci || 'V-00.000.000'}
      </text>
      
      ${cleanCollege ? `
      <text x="125" y="87" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="${encColor}">
        ${cleanCollege.replace(' · ', '')}
      </text>` : ''}
      
      <!-- Star embellishments -->
      <path d="M40 65 L43 68 L40 71 L37 68 Z" fill="${encColor}" opacity="0.7"/>
      <path d="M210 65 L213 68 L210 71 L207 68 Z" fill="${encColor}" opacity="0.7"/>

      <text x="125" y="${cleanCollege ? 104 : 96}" text-anchor="middle" font-family="cursive, sans-serif" font-size="7.5" fill="${encColor}" opacity="0.85">
        FIRMA &amp; SELLO AUTORIZADO
      </text>
    </svg>`;
  }

  if (style === 'circular') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
      <!-- Circular Rings -->
      <circle cx="100" cy="100" r="94" stroke="${encColor}" stroke-width="3" opacity="0.85"/>
      <circle cx="100" cy="100" r="88" stroke="${encColor}" stroke-width="1.2" stroke-dasharray="4 2" opacity="0.75"/>
      <circle cx="100" cy="100" r="54" stroke="${encColor}" stroke-width="1.2" opacity="0.6"/>
      
      <!-- Mini Caduceus inside circle -->
      <path d="M100 68 L100 132" stroke="${encColor}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="66" r="3.5" fill="${encColor}"/>
      <path d="M92 80 C108 75, 108 92, 100 97 C92 102, 92 118, 108 122" stroke="${encColor}" stroke-width="1.8" fill="none"/>
      <path d="M108 80 C92 75, 92 92, 100 97 C108 102, 108 118, 92 122" stroke="${encColor}" stroke-width="1.8" fill="none"/>
      
      <!-- Top Arc Text (Doctor Name) -->
      <text x="100" y="32" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="9" fill="${encColor}">
        ${cleanName.length > 28 ? cleanName.substring(0, 28) : cleanName}
      </text>
      
      <!-- Specialty -->
      <text x="100" y="44" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="7.5" fill="${encColor}">
        ${cleanSpec.length > 30 ? cleanSpec.substring(0, 30) : cleanSpec}
      </text>
      
      <!-- Bottom Text -->
      <text x="100" y="156" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="8" fill="${encColor}">
        M.P.P.S: ${mpps || '00.000'}
      </text>
      <text x="100" y="170" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="${encColor}">
        C.I: ${ci || 'V-00.000.000'}
      </text>
    </svg>`;
  }

  if (style === 'con-firma') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 130" fill="none">
      <!-- Stamp Box -->
      <rect x="8" y="10" width="234" height="110" rx="14" stroke="${encColor}" stroke-width="2.5" stroke-dasharray="5 3" opacity="0.75"/>
      <rect x="14" y="16" width="222" height="98" rx="10" stroke="${encColor}" stroke-width="1.2" opacity="0.6"/>
      
      <!-- Stamp Data Behind -->
      <text x="125" y="40" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="11" fill="${encColor}" letter-spacing="0.5" opacity="0.85">
        ${cleanName}
      </text>
      <text x="125" y="55" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="8.5" fill="${encColor}" opacity="0.8">
        ${cleanSpec.length > 36 ? cleanSpec.substring(0, 36) + '...' : cleanSpec}
      </text>
      <text x="125" y="70" text-anchor="middle" font-family="sans-serif" font-size="8" fill="${encColor}" opacity="0.8">
        M.P.P.S: ${mpps || '00.000'} · C.I: ${ci || 'V-00.000.000'}${cleanCollege}
      </text>

      <!-- Realistic Handwritten Signature Overlay in foreground -->
      <g opacity="0.95">
        <path d="M35 98 C50 65, 70 50, 85 85 C95 105, 110 70, 130 80 C150 90, 165 60, 195 75 C210 82, 225 72, 230 68" stroke="${encColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M55 75 Q120 105, 215 88" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <circle cx="218" cy="87" r="2.2" fill="${encColor}"/>
      </g>

      <text x="125" y="108" text-anchor="middle" font-family="sans-serif" font-size="7" fill="${encColor}" opacity="0.75">
        MÉDICO CIRUJANO - FIRMA AUTORIZADA
      </text>
    </svg>`;
  }

  // Default: Rectangular clásico
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 130" fill="none">
    <rect x="6" y="6" width="248" height="118" rx="16" stroke="${encColor}" stroke-width="3.5" stroke-dasharray="6 3" opacity="0.9"/>
    <rect x="13" y="13" width="234" height="104" rx="12" stroke="${encColor}" stroke-width="1.8" opacity="0.8"/>
    
    <text x="130" y="40" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="900" font-size="13" fill="${encColor}" letter-spacing="0.5">
      ${cleanName}
    </text>
    
    <text x="130" y="58" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700" font-size="9.5" fill="${encColor}">
      ${cleanSpec.length > 38 ? cleanSpec.substring(0, 38) + '...' : cleanSpec}
    </text>
    
    <text x="130" y="76" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="600" font-size="9" fill="${encColor}">
      M.P.P.S: ${mpps || '00.000'} · C.I: ${ci || 'V-00.000.000'}${cleanCollege}
    </text>
    
    <path d="M55 98 Q90 86, 125 100 T205 94" stroke="${encColor}" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.95"/>
    <text x="130" y="112" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-weight="700" font-size="8" fill="${encColor}" opacity="0.85">
      FIRMA Y SELLO OFICIAL
    </text>
  </svg>`;
}

// Calligraphic Doctor Signatures Generator
export type CalligraphicStyle = 
  | 'bucle-formal'
  | 'ejecutiva-pluma'
  | 'rapida-recipista'
  | 'iniciales-enlazadas'
  | 'quirurgica-fluida'
  | 'autorizada-formal';

export function createCalligraphicSignatureSVG(
  doctorName: string,
  style: CalligraphicStyle = 'bucle-formal',
  color: string = '#1e3a8a'
): string {
  const encColor = encodeURIComponent(color);
  const clean = doctorName.replace(/^(Dr\.|Dra\.|Médico|Cirujano)\s*/i, '').trim() || 'Médico Especialista';
  const parts = clean.split(' ');
  const firstName = parts[0] || 'Doctor';
  const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
  const initials = `${firstName.charAt(0)}.${lastName ? lastName.charAt(0) + '.' : ''}`;

  if (style === 'rapida-recipista') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" fill="none">
      <path d="M25 80 C35 30, 48 20, 60 75 C70 95, 80 60, 95 70 T135 65 T175 60 T215 55" stroke="${encColor}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 75 Q130 95, 255 70" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M190 76 Q230 70, 260 62" stroke="${encColor}" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="262" cy="62" r="2.5" fill="${encColor}"/>
      <text x="75" y="62" font-family="'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive" font-size="28" font-style="italic" fill="${encColor}" opacity="0.95">
        ${firstName} ${lastName}
      </text>
    </svg>`;
  }

  if (style === 'iniciales-enlazadas') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" fill="none">
      <path d="M30 90 C30 35, 75 15, 85 55 C95 90, 60 100, 45 75 C30 50, 85 30, 140 60 C180 80, 210 50, 245 65" stroke="${encColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M50 82 Q140 105, 260 85" stroke="${encColor}" stroke-width="2" stroke-linecap="round"/>
      <text x="140" y="68" font-family="'Playfair Display', serif" font-weight="bold" font-style="italic" font-size="26" fill="${encColor}" letter-spacing="1">
        ${initials}
      </text>
      <circle cx="264" cy="85" r="2.5" fill="${encColor}"/>
    </svg>`;
  }

  if (style === 'ejecutiva-pluma') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" fill="none">
      <g transform="rotate(-6 140 60)">
        <text x="35" y="68" font-family="'Brush Script MT', 'Lucida Handwriting', 'Segoe Script', cursive" font-size="34" font-style="italic" fill="${encColor}">
          Dr. ${clean}
        </text>
        <path d="M25 82 C60 96, 160 88, 260 76" stroke="${encColor}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M180 86 Q225 88, 255 82" stroke="${encColor}" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="258" cy="82" r="2.2" fill="${encColor}"/>
      </g>
    </svg>`;
  }

  if (style === 'quirurgica-fluida') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" fill="none">
      <path d="M25 50 C40 25, 60 20, 65 75 C70 105, 90 40, 115 65 C135 85, 150 45, 175 60 C200 75, 220 50, 255 58" stroke="${encColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 85 Q120 102, 260 78" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round"/>
      <text x="60" y="60" font-family="'Segoe Script', 'Brush Script MT', cursive" font-size="28" fill="${encColor}" opacity="0.9">
        ${clean}
      </text>
    </svg>`;
  }

  if (style === 'autorizada-formal') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" fill="none">
      <path d="M30 75 C45 25, 65 20, 75 70 C85 100, 105 50, 130 65 T190 60 T250 55" stroke="${encColor}" stroke-width="2.5" stroke-linecap="round"/>
      <text x="45" y="62" font-family="'Brush Script MT', 'Dancing Script', cursive" font-size="32" font-style="italic" fill="${encColor}">
        ${clean}
      </text>
      <path d="M40 82 L250 82" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M220 72 L245 88 L255 60" stroke="${encColor}" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }

  // Default: bucle-formal
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" fill="none">
    <path d="M30 75 C30 25, 70 15, 80 60 C90 95, 65 105, 50 85 C35 60, 90 40, 140 65 C175 80, 205 50, 245 62" stroke="${encColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="65" y="62" font-family="'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive" font-size="32" font-style="italic" fill="${encColor}">
      ${clean}
    </text>
    <path d="M45 84 Q140 106, 260 80" stroke="${encColor}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="263" cy="80" r="2.5" fill="${encColor}"/>
  </svg>`;
}

export const DEFAULT_DOCTOR_CONFIG: DoctorConfig = {
  id: "col-1",
  profileName: "",
  doctorName: "",
  specialty: "",
  mpps: "",
  ci: "",
  collegeNumber: "",
  phone: "",
  email: "",
  socialHandle: "",
  socialHandle2: "",
  institution: "",
  institutionDetails: "",
  headerStyle: "clasico",
  headerLayout: "ambos-logos",
  tonePapel: "#ffffff",
  fuenteHeader: "'Roboto', sans-serif",
  headerColor: "#1e3a8a",
  fuenteNombre: "'Roboto', sans-serif",
  nombreSize: "1.35rem",
  nombreColor: "#1e3a8a",
  primaryDocColor: "#2563eb",
  borderStyle: "solido",
  docCornerRadius: "16px",
  logoSize: 52,
  formaLogo: "logo-redondo",
  watermarkOpacity: 0.05,
  watermarkScale: 55,
  watermarkRotation: 0,
  logoIzq: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
  logoDer: "",
  marcaAgua: DIGITAL_MEDIC_OFFICIAL_LOGO_SVG,
  firmaImg: "",
  selloImg: "",
  selloFirma: "",
  rxTitle: "Rp.",
  rxTitleColor: "#2563eb",
  bodyFontSize: "13.5px",
  footerNotesText: "",
  footerDisclaimer: "Válido por 30 días a partir de su fecha de emisión.",
  signatureTitle: "Firma del médico (a)",
  showMedicalSymbols: true,
  medicalSymbolType: 'esculapio',
  medicalSymbolColor: '#2563eb',
  folioPrefix: 'REC-',
  folioNumber: 1,
  isPaidClient: true,
  paidPlanName: 'Plan Digital Medic Pro',
  paymentStatus: 'activo'
};
