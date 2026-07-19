export const WHATSAPP_URL =
  'https://wa.me/6289518443354?text=Halo%20Amanah%20Berkah%20Haromain,%20saya%20ingin%20konsultasi%20gratis%20paket%20umroh.'

export type Feature = {
  icon: string
  title: string
  desc: string
}

export const features: Feature[] = [
  {
    icon: 'BadgeCheck',
    title: 'Berizin Resmi & Terintegrasi Siskopatuh',
    desc: 'Kantongi izin PPIU & PIHK dari Kemenag RI. Terlindungi hukum, diakui pemerintah — beribadah tanpa rasa khawatir.',
  },
  {
    icon: 'ShieldCheck',
    title: '100% Pasti Berangkat',
    desc: 'Jadwal jelas sejak hari pertama daftar. Tidak ada cerita jamaah tertunda atau dibatalkan sepihak.',
  },
  {
    icon: 'Star',
    title: 'Direkomendasikan Saudi Tourism Authority',
    desc: 'Satu dari 5 travel terbaik Indonesia yang resmi menandatangani MOU dengan Saudi Tourism Authority.',
  },
  {
    icon: 'Clock',
    title: 'Berpengalaman dan Terpercaya',
    desc: 'Kami mendampingi jamaah ke Tanah Suci dengan komitmen pelayanan terbaik untuk kemudahan ibadah Anda.',
  },
  {
    icon: 'GraduationCap',
    title: 'Pembimbing Bersertifikasi BNSP',
    desc: 'Didampingi Muthawif profesional yang memahami syariat dan sunah. Tersedia Muthawif wanita khusus untuk Raudhah.',
  },
  {
    icon: 'Heart',
    title: 'Ribuan Jamaah Telah Kami Berangkatkan',
    desc: 'Kepercayaan jamaah adalah prioritas utama kami untuk terus menyempurnakan layanan dari hati.',
  },
]

export type Package = {
  name: string
  days: string
  flight: string
  price: string
  madinahHotel: string
  makkahHotel: string
  isPromo?: boolean
  isVIP?: boolean
  bonus?: string[]
}

export const paketUmroh: Package[] = [
  {
    name: 'Paket Promo 9 D',
    days: '9 Hari',
    flight: 'Qatar / Oman / Emirates',
    price: '28.5 Juta',
    madinahHotel: 'Hayah Taibah / Setaraf',
    makkahHotel: 'Manazel Al hijra / Rehab Taqwa / Setaraf',
    isPromo: true,
  },
  {
    name: 'Paket Hemat 9 D',
    days: '9 Hari',
    flight: 'Qatar / Oman / Emirates',
    price: '29.85 Juta',
    madinahHotel: 'Al Muhtara Golden / Jauharat Rosyid / Setaraf',
    makkahHotel: 'Wahah Deafah / Mater Jewar / Setaraf',
  },
  {
    name: 'Paket 12 D',
    days: '12 Hari',
    flight: 'Saudia / Garuda Direct (Tanpa Transit)',
    price: '35 Juta',
    madinahHotel: 'RuA International / ODST / Setaraf',
    makkahHotel: 'Azka Assofa / Prestice / Rayyana / Anjum Hotel',
  },
  {
    name: 'Paket VIP 9 D',
    days: '9 Hari',
    flight: 'Saudia / Garuda',
    price: '37.5 Juta',
    madinahHotel: 'Maden / Milenium Al Aqeq / Setaraf (Bintang 5)',
    makkahHotel: 'Grand Zam Zam / Sofwah Orchid (Bintang 5)',
    isVIP: true,
    bonus: ['Free Kereta Cepat Madinah Makkah'],
  },
  {
    name: 'Paket VIP 12 D',
    days: '12 Hari',
    flight: 'Saudia',
    price: '40.5 Juta',
    madinahHotel: 'Maden / Haritia / Setaraf (Bintang 5)',
    makkahHotel: 'Grand Zam Zam / Sofwah Orchid / Fairmont Hotel (Bintang 5)',
    isVIP: true,
    bonus: ['Free Kereta Cepat', 'Perlengkapan Eksklusif'],
  },
]

export type Schedule = {
  date: string
  name: string
  allIn: boolean
  tags: string[]
  duration: string
  flight: string
  landing: string
  price: string
  status: 'open' | 'full'
  image: string
}

export const schedules: Schedule[] = [
  {
    date: '25 Agu 2026',
    name: 'Paket Promo 9 D',
    allIn: true,
    tags: ['Promo', 'Ekonomis'],
    duration: '9 Hari',
    flight: 'Qatar / Oman / Emirates',
    landing: 'Madinah',
    price: 'Rp. 28,5 Juta',
    status: 'open',
    image: '/images/hero-kaaba.png',
  },
  {
    date: '1 Sep 2026',
    name: 'Paket Hemat 9 D',
    allIn: true,
    tags: ['Hemat', 'Terjangkau'],
    duration: '9 Hari',
    flight: 'Qatar / Oman / Emirates',
    landing: 'Madinah',
    price: 'Rp. 29,85 Juta',
    status: 'open',
    image: '/images/jamaah.png',
  },
  {
    date: '12 Sep 2026',
    name: 'Paket 12 D',
    allIn: true,
    tags: ['Direct Flight', 'Tanpa Transit'],
    duration: '12 Hari',
    flight: 'Saudia / Garuda Direct',
    landing: 'Jeddah',
    price: 'Rp. 35 Juta',
    status: 'open',
    image: '/images/madinah.png',
  },
  {
    date: '22 Sep 2026',
    name: 'Paket VIP 9 D',
    allIn: true,
    tags: ['Bintang 5', 'Kereta Cepat'],
    duration: '9 Hari',
    flight: 'Saudia / Garuda',
    landing: 'Madinah',
    price: 'Rp. 37,5 Juta',
    status: 'open',
    image: '/images/wisata-halal.png',
  },
  {
    date: '5 Okt 2026',
    name: 'Paket VIP 12 D',
    allIn: true,
    tags: ['Premium Bintang 5', 'Kereta Cepat'],
    duration: '12 Hari',
    flight: 'Saudia',
    landing: 'Madinah',
    price: 'Rp. 40,5 Juta',
    status: 'open',
    image: '/images/turki.png',
  },
]

export type Service = {
  title: string
  desc: string
  image: string
}

export const services: Service[] = [
  {
    title: 'Program Wakaf Al-Qur’an',
    desc: 'Tebar 10.000 Al-Qur’an ke pelosok Indonesia bersama Amanah Berkah Haromain.',
    image: '/images/jamaah.png',
  },
  {
    title: 'Wisata Halal',
    desc: 'Jelajahi destinasi dunia dengan layanan halal, aman, dan nyaman.',
    image: '/images/wisata-halal.png',
  },
  {
    title: 'Haji Khusus',
    desc: 'Program Haji Khusus dengan fasilitas premium dan pembimbing bersertifikat.',
    image: '/images/madinah.png',
  },
  {
    title: 'Umroh Libur Akhir Tahun',
    desc: 'Manfaatkan momen liburan untuk beribadah bersama keluarga tercinta.',
    image: '/images/turki.png',
  },
]

export type Testimonial = {
  name: string
  role: string
  text: string
}

export const testimonials: Testimonial[] = [
  {
    name: 'Hj. Siti Aminah',
    role: 'Jamaah Umroh Bandung',
    text: 'Alhamdulillah pelayanannya sangat memuaskan. Pembimbingnya sabar dan sangat membantu selama di Tanah Suci. Insya Allah tahun depan berangkat lagi bersama Amanah Berkah Haromain.',
  },
  {
    name: 'H. Bambang Suryanto',
    role: 'Jamaah Umroh VIP',
    text: 'Jadwal berangkat tepat waktu, hotel dekat dengan Masjidil Haram, dan pelayanan kereta cepat sangat membantu. Sangat berkesan untuk keluarga kami.',
  },
  {
    name: 'Ustadzah Nurhayati',
    role: 'Jamaah Umroh Hemat',
    text: 'Amanah Berkah Haromain memang terpercaya. Semua proses dari pendaftaran sampai kepulangan diurus dengan profesional dan amanah. Terima kasih ABH.',
  },
  {
    name: 'H. Ahmad Fauzi',
    role: 'Jamaah Haji Khusus / VIP',
    text: 'Fasilitas bintang lima dan Muthawif yang sangat memahami sunah. Pengalaman ibadah yang khusyuk dan tak terlupakan bersama Amanah Berkah Haromain.',
  },
]
