export interface ProjectImage {
  url: string;
  description: string;
  descriptionEs: string;
}

export interface Project {
  id: string;
  title: string;
  titleEs: string;
  category: string;
  categoryEs: string;
  status: 'build' | 'complete';
  image: string;
  description: string;
  descriptionEs: string;
  gallery: ProjectImage[];
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Conviasa Hangar",
    titleEs: "Hangar Conviasa",
    category: "Industrial",
    categoryEs: "Industrial",
    status: "complete",
    image: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322292/1_2_-_Photo_y1qand.jpg",
    description: "A massive industrial hangar designed for aircraft maintenance and storage.",
    descriptionEs: "Un enorme hangar industrial diseñado para el mantenimiento y almacenamiento de aeronaves.",
    gallery: [
      { url: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322292/1_2_-_Photo_y1qand.jpg", description: "Wide span structure for maximum space.", descriptionEs: "Estructura de gran luz para el máximo espacio." },
      { url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80", description: "Industrial detail.", descriptionEs: "Detalle industrial." },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80", description: "Exterior view.", descriptionEs: "Vista exterior." },
      { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80", description: "Aerial perspective.", descriptionEs: "Perspectiva aérea." },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", description: "Interior lighting.", descriptionEs: "Iluminación interior." }
    ]
  },
  {
    id: "2",
    title: "Modern Fitness Center",
    titleEs: "Gimnasio Moderno",
    category: "Commercial",
    categoryEs: "Comercial",
    status: "build",
    image: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322295/balance-24_zophfl.jpg",
    description: "State-of-the-art fitness facility with premium equipment and dynamic lighting.",
    descriptionEs: "Instalaciones de fitness de última generación con equipamiento premium e iluminación dinámica.",
    gallery: [
      { url: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322295/balance-24_zophfl.jpg", description: "Cardio area with city views.", descriptionEs: "Área de cardio con vistas a la ciudad." },
      { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80", description: "Weight training zone.", descriptionEs: "Zona de entrenamiento con pesas." },
      { url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80", description: "Modern equipment.", descriptionEs: "Equipamiento moderno." },
      { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80", description: "Yoga studio.", descriptionEs: "Estudio de yoga." },
      { url: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80", description: "Locker rooms.", descriptionEs: "Vestuarios." }
    ]
  },
  {
    id: "3",
    title: "Mountain View Kitchen",
    titleEs: "Cocina con Vista a la Montaña",
    category: "Residential",
    categoryEs: "Residencial",
    status: "complete",
    image: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322298/Copia_de_ABREU-31_lj7akh.jpg",
    description: "A sleek, dark-toned modern kitchen featuring panoramic windows overlooking the lush landscape.",
    descriptionEs: "Una elegante cocina moderna de tonos oscuros con ventanas panorámicas que dan al exuberante paisaje.",
    gallery: [
      { url: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322298/Copia_de_ABREU-31_lj7akh.jpg", description: "Minimalist island and copper seating.", descriptionEs: "Isla minimalista y asientos de cobre." },
      { url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80", description: "Modern appliances.", descriptionEs: "Electrodomésticos modernos." },
      { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80", description: "Open plan living.", descriptionEs: "Sala de estar de planta abierta." },
      { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80", description: "Natural light.", descriptionEs: "Luz natural." },
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80", description: "Luxury finishes.", descriptionEs: "Acabados de lujo." }
    ]
  },
  {
    id: "4",
    title: "Yellow Pillars Corridor",
    titleEs: "Pasillo de Pilares Amarillos",
    category: "Architecture",
    categoryEs: "Arquitectura",
    status: "build",
    image: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322294/sambilito-14_jeifmb.jpg",
    description: "An striking architectural corridor defined by bold yellow structural pillars and metallic elements.",
    descriptionEs: "Un llamativo pasillo arquitectónico definido por audaces pilares estructurales amarillos y elementos metálicos.",
    gallery: [
      { url: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322294/sambilito-14_jeifmb.jpg", description: "Industrial aesthetic with vibrant colors.", descriptionEs: "Estética industrial con colores vibrantes." },
      { url: "https://images.unsplash.com/photo-1517245318773-502552363b24?auto=format&fit=crop&q=80", description: "Structural detail.", descriptionEs: "Detalle estructural." },
      { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80", description: "Modern architecture.", descriptionEs: "Arquitectura moderna." },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80", description: "Urban landscape.", descriptionEs: "Paisaje urbano." },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", description: "Interior perspective.", descriptionEs: "Perspectiva interior." }
    ]
  },
  {
    id: "5",
    title: "Forum Building",
    titleEs: "Edificio Forum",
    category: "Commercial",
    categoryEs: "Comercial",
    status: "complete",
    image: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322298/1._TECHO_EXTERIOR_wn5zwm.png",
    description: "A contemporary commercial complex featuring dynamic facades and integrated public spaces.",
    descriptionEs: "Un complejo comercial contemporáneo que presenta fachadas dinámicas y espacios públicos integrados.",
    gallery: [
      { url: "https://res.cloudinary.com/debywjrlg/image/upload/v1773322298/1._TECHO_EXTERIOR_wn5zwm.png", description: "Exterior view of the Forum complex.", descriptionEs: "Vista exterior del complejo Forum." },
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80", description: "Facade detail.", descriptionEs: "Detalle de fachada." },
      { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80", description: "Public space.", descriptionEs: "Espacio público." },
      { url: "https://images.unsplash.com/photo-1517245318773-502552363b24?auto=format&fit=crop&q=80", description: "Night view.", descriptionEs: "Vista nocturna." },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", description: "Entrance hall.", descriptionEs: "Hall de entrada." }
    ]
  }
];
