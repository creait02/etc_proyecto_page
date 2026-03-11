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
    image: "/images/1.%20TECHO%20EXTERIOR.png",
    description: "A massive industrial hangar designed for aircraft maintenance and storage.",
    descriptionEs: "Un enorme hangar industrial diseñado para el mantenimiento y almacenamiento de aeronaves.",
    gallery: [
      { url: "/images/1.%20TECHO%20EXTERIOR.png", description: "Wide span structure for maximum space.", descriptionEs: "Estructura de gran luz para el máximo espacio." }
    ]
  },
  {
    id: "2",
    title: "Modern Fitness Center",
    titleEs: "Gimnasio Moderno",
    category: "Commercial",
    categoryEs: "Comercial",
    image: "/images/balance-24.jpg",
    description: "State-of-the-art fitness facility with premium equipment and dynamic lighting.",
    descriptionEs: "Instalaciones de fitness de última generación con equipamiento premium e iluminación dinámica.",
    gallery: [
      { url: "/images/balance-24.jpg", description: "Cardio area with city views.", descriptionEs: "Área de cardio con vistas a la ciudad." }
    ]
  },
  {
    id: "3",
    title: "Mountain View Kitchen",
    titleEs: "Cocina con Vista a la Montaña",
    category: "Residential",
    categoryEs: "Residencial",
    image: "/images/Copia%20de%20ABREU-31.jpg",
    description: "A sleek, dark-toned modern kitchen featuring panoramic windows overlooking the lush landscape.",
    descriptionEs: "Una elegante cocina moderna de tonos oscuros con ventanas panorámicas que dan al exuberante paisaje.",
    gallery: [
      { url: "/images/Copia%20de%20ABREU-31.jpg", description: "Minimalist island and copper seating.", descriptionEs: "Isla minimalista y asientos de cobre." }
    ]
  },
  {
    id: "4",
    title: "Yellow Pillars Corridor",
    titleEs: "Pasillo de Pilares Amarillos",
    category: "Architecture",
    categoryEs: "Arquitectura",
    image: "/images/sambilito-14.jpg",
    description: "An striking architectural corridor defined by bold yellow structural pillars and metallic elements.",
    descriptionEs: "Un llamativo pasillo arquitectónico definido por audaces pilares estructurales amarillos y elementos metálicos.",
    gallery: [
      { url: "/images/sambilito-14.jpg", description: "Industrial aesthetic with vibrant colors.", descriptionEs: "Estética industrial con colores vibrantes." }
    ]
  },
  {
    id: "5",
    title: "Forum Building",
    titleEs: "Edificio Forum",
    category: "Commercial",
    categoryEs: "Comercial",
    image: "/images/1_2%20-%20Photo.jpg",
    description: "A contemporary commercial complex featuring dynamic facades and integrated public spaces.",
    descriptionEs: "Un complejo comercial contemporáneo que presenta fachadas dinámicas y espacios públicos integrados.",
    gallery: [
      { url: "/images/1_2%20-%20Photo.jpg", description: "Exterior view of the Forum complex.", descriptionEs: "Vista exterior del complejo Forum." }
    ]
  }
];
