export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export const projects: Project[] = [
  {
    id: "1",
    title: "Kensington Townhouse",
    category: "Residential",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&auto=format&fit=crop",
    description: "A complete refurbishment of a Grade II listed property in the heart of Kensington."
  },
  {
    id: "2",
    title: "Battersea Loft",
    category: "Interior Design",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2400&auto=format&fit=crop",
    description: "Industrial elegance meets modern luxury in this converted warehouse apartment."
  },
  {
    id: "3",
    title: "Notting Hill Villa",
    category: "Architecture",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2400&auto=format&fit=crop",
    description: "Contemporary extension and basement excavation for a family home."
  },
  {
    id: "4",
    title: "Chelsea Penthouse",
    category: "Residential",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop",
    description: "Panoramic views and bespoke joinery define this luxury penthouse."
  },
  {
    id: "5",
    title: "Mayfair Office",
    category: "Commercial",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2400&auto=format&fit=crop",
    description: "A boutique workspace designed for collaboration and focus."
  }
];
