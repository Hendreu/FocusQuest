/**
 * Seed script — populates badges, quests and avatar items.
 * Run: bun src/db/seed.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import {
  badges,
  quests,
  avatarItems,
  users,
  userPreferences,
  userCoins,
  streaks,
  avatars,
  userLevels,
  courses,
  modules,
  lessons,
  lessonContent,
} from "./schema";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

// ===========================================================================
// Badges (10)
// ===========================================================================

const BADGES = [
  {
    slug: "first-lesson",
    name: "First Steps",
    description: "Complete your very first lesson.",
    criteria: { type: "lessons_completed", threshold: 1 },
    isPremium: false,
  },
  {
    slug: "streak-3",
    name: "3-Day Warrior",
    description: "Maintain a 3-day learning streak.",
    criteria: { type: "streak", threshold: 3 },
    isPremium: false,
  },
  {
    slug: "streak-7",
    name: "Week Champion",
    description: "Maintain a 7-day learning streak.",
    criteria: { type: "streak", threshold: 7 },
    isPremium: false,
  },
  {
    slug: "streak-30",
    name: "Monthly Master",
    description: "Maintain a 30-day learning streak.",
    criteria: { type: "streak", threshold: 30 },
    isPremium: false,
  },
  {
    slug: "level-5",
    name: "Rising Star",
    description: "Reach Level 5.",
    criteria: { type: "level", threshold: 5 },
    isPremium: false,
  },
  {
    slug: "level-10",
    name: "Knowledge Seeker",
    description: "Reach Level 10.",
    criteria: { type: "level", threshold: 10 },
    isPremium: false,
  },
  {
    slug: "level-25",
    name: "FocusQuest Legend",
    description: "Reach Level 25.",
    criteria: { type: "level", threshold: 25 },
    isPremium: false,
  },
  {
    slug: "quest-master",
    name: "Quest Master",
    description: "Complete 10 quests.",
    criteria: { type: "quests_completed", threshold: 10 },
    isPremium: false,
  },
  {
    slug: "early-adopter",
    name: "Early Adopter",
    description: "Join FocusQuest in its first year.",
    criteria: { type: "join_before", date: "2026-01-01" },
    isPremium: false,
  },
  {
    slug: "premium-member",
    name: "Premium Member",
    description: "Fez upgrade para o plano premium",
    icon: "⭐",
    xpReward: 500,
    criteria: JSON.stringify({ type: "plan_upgrade" }),
    isPremium: false,
  },
];

// ===========================================================================
// Quests (5)
// ===========================================================================

const QUESTS = [
  {
    slug: "complete-3-lessons-today",
    title: "Daily Dash",
    description: "Complete 3 lessons today.",
    xpReward: 150,
    coinReward: 20,
    criteria: { type: "lessons_today", target: 3 },
    isPremium: false,
  },
  {
    slug: "7-day-streak",
    title: "Streak Hero",
    description: "Reach a 7-day streak.",
    xpReward: 300,
    coinReward: 50,
    criteria: { type: "streak", target: 7 },
    isPremium: false,
  },
  {
    slug: "finish-first-course",
    title: "Course Finisher",
    description: "Complete your first full course.",
    xpReward: 500,
    coinReward: 100,
    criteria: { type: "courses_completed", target: 1 },
    isPremium: false,
  },
  {
    slug: "earn-500-xp",
    title: "XP Collector",
    description: "Earn 500 total XP.",
    xpReward: 100,
    coinReward: 25,
    criteria: { type: "total_xp", target: 500 },
    isPremium: false,
  },
  {
    slug: "complete-10-quizzes",
    title: "Quiz Wizard",
    description: "Complete 10 quizzes with a score of 70%+.",
    xpReward: 250,
    coinReward: 40,
    criteria: { type: "quizzes_passed", target: 10, minScore: 70 },
    isPremium: false,
  },
];

// ===========================================================================
// Avatar items (10 free + 15 premium = 25)
// ===========================================================================

const AVATAR_ITEMS = [
  // Free hats (3)
  {
    slug: "hat-beanie",
    name: "Beanie",
    type: "hat" as const,
    costCoins: 0,
    isPremium: false,
    previewUrl: "/avatars/items/hat-beanie.png",
    layerOrder: 10,
  },
  {
    slug: "hat-cap",
    name: "Baseball Cap",
    type: "hat" as const,
    costCoins: 50,
    isPremium: false,
    previewUrl: "/avatars/items/hat-cap.png",
    layerOrder: 10,
  },
  {
    slug: "hat-graduation",
    name: "Graduation Cap",
    type: "hat" as const,
    costCoins: 80,
    isPremium: false,
    previewUrl: "/avatars/items/hat-graduation.png",
    layerOrder: 10,
  },

  // Free clothing (3)
  {
    slug: "shirt-blue",
    name: "Blue T-Shirt",
    type: "clothing" as const,
    costCoins: 0,
    isPremium: false,
    previewUrl: "/avatars/items/shirt-blue.png",
    layerOrder: 5,
  },
  {
    slug: "shirt-hoodie",
    name: "Grey Hoodie",
    type: "clothing" as const,
    costCoins: 60,
    isPremium: false,
    previewUrl: "/avatars/items/shirt-hoodie.png",
    layerOrder: 5,
  },
  {
    slug: "shirt-formal",
    name: "Formal Shirt",
    type: "clothing" as const,
    costCoins: 70,
    isPremium: false,
    previewUrl: "/avatars/items/shirt-formal.png",
    layerOrder: 5,
  },

  // Free accessories (2)
  {
    slug: "glasses-round",
    name: "Round Glasses",
    type: "accessory" as const,
    costCoins: 40,
    isPremium: false,
    previewUrl: "/avatars/items/glasses-round.png",
    layerOrder: 8,
  },
  {
    slug: "backpack-blue",
    name: "Blue Backpack",
    type: "accessory" as const,
    costCoins: 55,
    isPremium: false,
    previewUrl: "/avatars/items/backpack-blue.png",
    layerOrder: 3,
  },

  // Free backgrounds (2)
  {
    slug: "bg-library",
    name: "Library",
    type: "background" as const,
    costCoins: 0,
    isPremium: false,
    previewUrl: "/avatars/items/bg-library.png",
    layerOrder: 0,
  },
  {
    slug: "bg-park",
    name: "Park",
    type: "background" as const,
    costCoins: 30,
    isPremium: false,
    previewUrl: "/avatars/items/bg-park.png",
    layerOrder: 0,
  },

  // Premium hats (3)
  {
    slug: "hat-wizard",
    name: "Wizard Hat",
    type: "hat" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/hat-wizard.png",
    layerOrder: 10,
  },
  {
    slug: "hat-crown",
    name: "Royal Crown",
    type: "hat" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/hat-crown.png",
    layerOrder: 10,
  },
  {
    slug: "hat-headphones",
    name: "Gaming Headphones",
    type: "hat" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/hat-headphones.png",
    layerOrder: 10,
  },

  // Premium clothing (4)
  {
    slug: "shirt-superhero",
    name: "Superhero Cape",
    type: "clothing" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/shirt-superhero.png",
    layerOrder: 5,
  },
  {
    slug: "shirt-lab",
    name: "Lab Coat",
    type: "clothing" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/shirt-lab.png",
    layerOrder: 5,
  },
  {
    slug: "shirt-ninja",
    name: "Ninja Outfit",
    type: "clothing" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/shirt-ninja.png",
    layerOrder: 5,
  },
  {
    slug: "shirt-astronaut",
    name: "Astronaut Suit",
    type: "clothing" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/shirt-astronaut.png",
    layerOrder: 5,
  },

  // Premium accessories (4)
  {
    slug: "glasses-vr",
    name: "VR Goggles",
    type: "accessory" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/glasses-vr.png",
    layerOrder: 8,
  },
  {
    slug: "pet-cat",
    name: "Companion Cat",
    type: "accessory" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/pet-cat.png",
    layerOrder: 2,
  },
  {
    slug: "pet-robot",
    name: "Mini Robot",
    type: "accessory" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/pet-robot.png",
    layerOrder: 2,
  },
  {
    slug: "wings-angel",
    name: "Angel Wings",
    type: "accessory" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/wings-angel.png",
    layerOrder: 1,
  },

  // Premium backgrounds (4)
  {
    slug: "bg-space",
    name: "Outer Space",
    type: "background" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/bg-space.png",
    layerOrder: 0,
  },
  {
    slug: "bg-castle",
    name: "Magic Castle",
    type: "background" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/bg-castle.png",
    layerOrder: 0,
  },
  {
    slug: "bg-futuristic",
    name: "Futuristic City",
    type: "background" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/bg-futuristic.png",
    layerOrder: 0,
  },
  {
    slug: "bg-underwater",
    name: "Underwater World",
    type: "background" as const,
    costCoins: 0,
    isPremium: true,
    previewUrl: "/avatars/items/bg-underwater.png",
    layerOrder: 0,
  },
];

// ===========================================================================
// Courses, Modules, Lessons & Content
// ===========================================================================

// Stable UUIDs so seed is idempotent
const COURSE_IDS = {
  focoProdutividade: "c0000001-0000-4000-a000-000000000001",
  aprendizadoEficaz: "c0000002-0000-4000-a000-000000000002",
  autoconhecimentoTDAH: "c0000003-0000-4000-a000-000000000003",
  javaZeroApi: "c0000004-0000-4000-a000-000000000004",
  javaZeroApiEn: "c0000005-0000-4000-a000-000000000005",
};

const MODULE_IDS = {
  // Foco & Produtividade
  fundamentosFoco: "a0000001-0000-4000-a000-000000000001",
  tecnicasPraticas: "a0000002-0000-4000-a000-000000000002",
  rotinaSustentavel: "a0000003-0000-4000-a000-000000000003",
  // Aprendizado Eficaz
  comoAprendo: "a0000004-0000-4000-a000-000000000004",
  memoriaRetencao: "a0000005-0000-4000-a000-000000000005",
  estudoAtivo: "a0000006-0000-4000-a000-000000000006",
  // Autoconhecimento & TDAH
  entendendoTDAH: "a0000007-0000-4000-a000-000000000007",
  estrategiasdia: "a0000008-0000-4000-a000-000000000008",
  comunidadeApoio: "a0000009-0000-4000-a000-000000000009",
  // Java do Zero a Primeira API
  javaIntroInstalacao: "a000000a-0000-4000-a000-00000000000a",
  javaVariaveisTipos: "a000000b-0000-4000-a000-00000000000b",
  javaCondicionais: "a000000c-0000-4000-a000-00000000000c",
  javaLoops: "a000000d-0000-4000-a000-00000000000d",
  javaArraysStrings: "a000000e-0000-4000-a000-00000000000e",
  javaOopBasico: "a000000f-0000-4000-a000-00000000000f",
  javaHerancaPoli: "a0000010-0000-4000-a000-000000000010",
  javaCollections: "a0000011-0000-4000-a000-000000000011",
  javaExcecoes: "a0000012-0000-4000-a000-000000000012",
  javaSpringApi: "a0000013-0000-4000-a000-000000000013",
  // Java from Zero to Your First API (English)
  javaIntroInstalacaoEn: "a0000014-0000-4000-a000-000000000014",
  javaVariaveisTiposEn: "a0000015-0000-4000-a000-000000000015",
  javaCondicionaisEn: "a0000016-0000-4000-a000-000000000016",
  javaLoopsEn: "a0000017-0000-4000-a000-000000000017",
  javaArraysStringsEn: "a0000018-0000-4000-a000-000000000018",
  javaOopBasicoEn: "a0000019-0000-4000-a000-000000000019",
  javaHerancaPoliEn: "a000001a-0000-4000-a000-000000000a1a",
  javaCollectionsEn: "a000001b-0000-4000-a000-000000000b1b",
  javaExcecoesEn: "a000001c-0000-4000-a000-000000000c1c",
  javaSpringApiEn: "a000001d-0000-4000-a000-000000000d1d",
};

const LESSON_IDS = {
  // Foco & Produtividade > Fundamentos
  l01: "d0000001-0000-4000-a000-000000000001",
  l02: "d0000002-0000-4000-a000-000000000002",
  l03: "d0000003-0000-4000-a000-000000000003",
  // Foco & Produtividade > Tecnicas
  l04: "d0000004-0000-4000-a000-000000000004",
  l05: "d0000005-0000-4000-a000-000000000005",
  l06: "d0000006-0000-4000-a000-000000000006",
  // Foco & Produtividade > Rotina
  l07: "d0000007-0000-4000-a000-000000000007",
  l08: "d0000008-0000-4000-a000-000000000008",
  // Aprendizado Eficaz > Como Aprendo
  l09: "d0000009-0000-4000-a000-000000000009",
  l10: "d0000010-0000-4000-a000-000000000010",
  // Aprendizado Eficaz > Memoria
  l11: "d0000011-0000-4000-a000-000000000011",
  l12: "d0000012-0000-4000-a000-000000000012",
  l13: "d0000013-0000-4000-a000-000000000013",
  // Aprendizado Eficaz > Estudo Ativo
  l14: "d0000014-0000-4000-a000-000000000014",
  l15: "d0000015-0000-4000-a000-000000000015",
  // Autoconhecimento > Entendendo TDAH
  l16: "d0000016-0000-4000-a000-000000000016",
  l17: "d0000017-0000-4000-a000-000000000017",
  l18: "d0000018-0000-4000-a000-000000000018",
  // Autoconhecimento > Estrategias
  l19: "d0000019-0000-4000-a000-000000000019",
  l20: "d0000020-0000-4000-a000-000000000020",
  l21: "d0000021-0000-4000-a000-000000000021",
  // Autoconhecimento > Comunidade
  l22: "d0000022-0000-4000-a000-000000000022",
  l23: "d0000023-0000-4000-a000-000000000023",
  // Java > Intro & Instalação
  jl01: "d0000024-0000-4000-a000-000000000024",
  jl02: "d0000025-0000-4000-a000-000000000025",
  jl03: "d0000026-0000-4000-a000-000000000026",
  // Java > Variáveis e Tipos
  jl04: "d0000027-0000-4000-a000-000000000027",
  jl05: "d0000028-0000-4000-a000-000000000028",
  jl06: "d0000029-0000-4000-a000-000000000029",
  // Java > Condicionais
  jl07: "d000002a-0000-4000-a000-00000000002a",
  jl08: "d000002b-0000-4000-a000-00000000002b",
  // Java > Loops
  jl09: "d000002c-0000-4000-a000-00000000002c",
  jl10: "d000002d-0000-4000-a000-00000000002d",
  jl11: "d000002e-0000-4000-a000-00000000002e",
  // Java > Arrays & Strings
  jl12: "d000002f-0000-4000-a000-00000000002f",
  jl13: "d0000030-0000-4000-a000-000000000030",
  // Java > OOP Básico
  jl14: "d0000031-0000-4000-a000-000000000031",
  jl15: "d0000032-0000-4000-a000-000000000032",
  jl16: "d0000033-0000-4000-a000-000000000033",
  // Java > Herança & Polimorfismo
  jl17: "d0000034-0000-4000-a000-000000000034",
  jl18: "d0000035-0000-4000-a000-000000000035",
  jl19: "d0000036-0000-4000-a000-000000000036",
  // Java > Collections
  jl20: "d0000037-0000-4000-a000-000000000037",
  jl21: "d0000038-0000-4000-a000-000000000038",
  // Java > Exceções
  jl22: "d0000039-0000-4000-a000-000000000039",
  jl23: "d000003a-0000-4000-a000-00000000003a",
  // Java > Spring Boot & API REST
  jl24: "d000003b-0000-4000-a000-00000000003b",
  jl25: "d000003c-0000-4000-a000-00000000003c",
  jl26: "d000003d-0000-4000-a000-00000000003d",
  jl27: "d000003e-0000-4000-a000-00000000003e",
  // Java English lessons
  jl01en: "d000003f-0000-4000-a000-00000000003f",
  jl02en: "d0000040-0000-4000-a000-000000000040",
  jl03en: "d0000041-0000-4000-a000-000000000041",
  jl04en: "d0000042-0000-4000-a000-000000000042",
  jl05en: "d0000043-0000-4000-a000-000000000043",
  jl06en: "d0000044-0000-4000-a000-000000000044",
  jl07en: "d0000045-0000-4000-a000-000000000045",
  jl08en: "d0000046-0000-4000-a000-000000000046",
  jl09en: "d0000047-0000-4000-a000-000000000047",
  jl10en: "d0000048-0000-4000-a000-000000000048",
  jl11en: "d0000049-0000-4000-a000-000000000049",
  jl12en: "d000004a-0000-4000-a000-00000000004a",
  jl13en: "d000004b-0000-4000-a000-00000000004b",
  jl14en: "d000004c-0000-4000-a000-00000000004c",
  jl15en: "d000004d-0000-4000-a000-00000000004d",
  jl16en: "d000004e-0000-4000-a000-00000000004e",
  jl17en: "d000004f-0000-4000-a000-00000000004f",
  jl18en: "d0000050-0000-4000-a000-000000000050",
  jl19en: "d0000051-0000-4000-a000-000000000051",
  jl20en: "d0000052-0000-4000-a000-000000000052",
  jl21en: "d0000053-0000-4000-a000-000000000053",
  jl22en: "d0000054-0000-4000-a000-000000000054",
  jl23en: "d0000055-0000-4000-a000-000000000055",
  jl24en: "d0000056-0000-4000-a000-000000000056",
  jl25en: "d0000057-0000-4000-a000-000000000057",
  jl26en: "d0000058-0000-4000-a000-000000000058",
  jl27en: "d0000059-0000-4000-a000-000000000059",
};

const SEED_COURSES = [
  {
    id: COURSE_IDS.focoProdutividade,
    title: "Foco & Produtividade para Mentes Inquietas",
    description:
      "Aprenda estrategias comprovadas para melhorar seu foco e produtividade, especialmente desenhadas para quem tem dificuldade de concentracao. Descubra como usar seu hiperfoco a seu favor!",
    status: "published" as const,
    language: "pt-BR" as const,
    isPremium: false,
  },
  {
    id: COURSE_IDS.aprendizadoEficaz,
    title: "Aprendizado Eficaz: Tecnicas para Neurodivergentes",
    description:
      "Descubra como aprender mais rapido e reter informacoes por mais tempo usando metodos adaptados para diferentes estilos de aprendizagem. Ideal para quem sente que esquece tudo.",
    status: "published" as const,
    language: "pt-BR" as const,
    isPremium: false,
  },
  {
    id: COURSE_IDS.autoconhecimentoTDAH,
    title: "Autoconhecimento & TDAH: Entenda sua Mente",
    description:
      "Entenda como o TDAH afeta sua vida e aprenda a transformar desafios em superpoderes. Um guia pratico para conviver melhor consigo mesmo e alcalcar seus objetivos.",
    status: "published" as const,
    language: "pt-BR" as const,
    isPremium: false,
  },
  {
    id: COURSE_IDS.javaZeroApi,
    title: "Java do Zero à Primeira API",
    description:
      "Aprenda Java desde o basico ate construir sua primeira API REST com Spring Boot. Curso pratico, com exemplos de codigo em cada licao e quizzes para fixar o conhecimento. Ideal para quem quer comecar a programar!",
    status: "published" as const,
    language: "pt-BR" as const,
    isPremium: false,
  },
  {
    id: COURSE_IDS.javaZeroApiEn,
    title: "Java: From Zero to Your First API",
    description:
      "Learn Java from scratch all the way to building your first REST API with Spring Boot. Hands-on course with code examples in every lesson and quizzes to reinforce your knowledge. Ideal for those who want to start programming!",
    status: "published" as const,
    language: "en" as const,
    isPremium: false,
  },
];

const SEED_MODULES = [
  // Course 1: Foco & Produtividade
  {
    id: MODULE_IDS.fundamentosFoco,
    courseId: COURSE_IDS.focoProdutividade,
    title: "Fundamentos do Foco",
    order: 1,
  },
  {
    id: MODULE_IDS.tecnicasPraticas,
    courseId: COURSE_IDS.focoProdutividade,
    title: "Tecnicas Praticas",
    order: 2,
  },
  {
    id: MODULE_IDS.rotinaSustentavel,
    courseId: COURSE_IDS.focoProdutividade,
    title: "Criando uma Rotina Sustentavel",
    order: 3,
  },
  // Course 2: Aprendizado Eficaz
  {
    id: MODULE_IDS.comoAprendo,
    courseId: COURSE_IDS.aprendizadoEficaz,
    title: "Descubra Como Voce Aprende",
    order: 1,
  },
  {
    id: MODULE_IDS.memoriaRetencao,
    courseId: COURSE_IDS.aprendizadoEficaz,
    title: "Memoria e Retencao",
    order: 2,
  },
  {
    id: MODULE_IDS.estudoAtivo,
    courseId: COURSE_IDS.aprendizadoEficaz,
    title: "Estudo Ativo na Pratica",
    order: 3,
  },
  // Course 3: Autoconhecimento & TDAH
  {
    id: MODULE_IDS.entendendoTDAH,
    courseId: COURSE_IDS.autoconhecimentoTDAH,
    title: "Entendendo o TDAH",
    order: 1,
  },
  {
    id: MODULE_IDS.estrategiasdia,
    courseId: COURSE_IDS.autoconhecimentoTDAH,
    title: "Estrategias para o Dia a Dia",
    order: 2,
  },
  {
    id: MODULE_IDS.comunidadeApoio,
    courseId: COURSE_IDS.autoconhecimentoTDAH,
    title: "Comunidade e Apoio",
    order: 3,
  },
  // Course 4: Java do Zero à Primeira API
  {
    id: MODULE_IDS.javaIntroInstalacao,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Introducao e Instalacao",
    order: 1,
  },
  {
    id: MODULE_IDS.javaVariaveisTipos,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Variaveis e Tipos de Dados",
    order: 2,
  },
  {
    id: MODULE_IDS.javaCondicionais,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Condicionais: if, else e switch",
    order: 3,
  },
  {
    id: MODULE_IDS.javaLoops,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Loops: for, while e do-while",
    order: 4,
  },
  {
    id: MODULE_IDS.javaArraysStrings,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Arrays e Strings",
    order: 5,
  },
  {
    id: MODULE_IDS.javaOopBasico,
    courseId: COURSE_IDS.javaZeroApi,
    title: "OOP: Classes e Objetos",
    order: 6,
  },
  {
    id: MODULE_IDS.javaHerancaPoli,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Heranca e Polimorfismo",
    order: 7,
  },
  {
    id: MODULE_IDS.javaCollections,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Collections: List, Set e Map",
    order: 8,
  },
  {
    id: MODULE_IDS.javaExcecoes,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Tratamento de Excecoes",
    order: 9,
  },
  {
    id: MODULE_IDS.javaSpringApi,
    courseId: COURSE_IDS.javaZeroApi,
    title: "Spring Boot e sua Primeira API REST",
    order: 10,
  },
  // Course 5: Java from Zero to Your First API (English)
  {
    id: MODULE_IDS.javaIntroInstalacaoEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Introduction and Setup",
    order: 1,
  },
  {
    id: MODULE_IDS.javaVariaveisTiposEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Variables and Data Types",
    order: 2,
  },
  {
    id: MODULE_IDS.javaCondicionaisEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Conditionals: if, else and switch",
    order: 3,
  },
  {
    id: MODULE_IDS.javaLoopsEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Loops: for, while and do-while",
    order: 4,
  },
  {
    id: MODULE_IDS.javaArraysStringsEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Arrays and Strings",
    order: 5,
  },
  {
    id: MODULE_IDS.javaOopBasicoEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "OOP: Classes and Objects",
    order: 6,
  },
  {
    id: MODULE_IDS.javaHerancaPoliEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Inheritance and Polymorphism",
    order: 7,
  },
  {
    id: MODULE_IDS.javaCollectionsEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Collections: List, Set and Map",
    order: 8,
  },
  {
    id: MODULE_IDS.javaExcecoesEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Exception Handling",
    order: 9,
  },
  {
    id: MODULE_IDS.javaSpringApiEn,
    courseId: COURSE_IDS.javaZeroApiEn,
    title: "Spring Boot and Your First REST API",
    order: 10,
  },
];

const SEED_LESSONS = [
  // M1: Fundamentos do Foco
  {
    id: LESSON_IDS.l01,
    moduleId: MODULE_IDS.fundamentosFoco,
    title: "O que e foco e por que ele foge?",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l02,
    moduleId: MODULE_IDS.fundamentosFoco,
    title: "O cerebro e a atencao: como funciona?",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l03,
    moduleId: MODULE_IDS.fundamentosFoco,
    title: "Quiz: Teste seu conhecimento sobre foco",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M2: Tecnicas Praticas
  {
    id: LESSON_IDS.l04,
    moduleId: MODULE_IDS.tecnicasPraticas,
    title: "Tecnica Pomodoro Adaptada",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l05,
    moduleId: MODULE_IDS.tecnicasPraticas,
    title: "Body Doubling e Coworking Virtual",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l06,
    moduleId: MODULE_IDS.tecnicasPraticas,
    title: "Eliminando Distracoes Digitais",
    contentType: "text" as const,
    durationMinutes: 7,
    order: 3,
    status: "published" as const,
    xpReward: 50,
  },
  // M3: Rotina Sustentavel
  {
    id: LESSON_IDS.l07,
    moduleId: MODULE_IDS.rotinaSustentavel,
    title: "Montando uma rotina flexivel",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.l08,
    moduleId: MODULE_IDS.rotinaSustentavel,
    title: "Quiz: Sua rotina ideal",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 2,
    status: "published" as const,
    xpReward: 75,
  },
  // M4: Descubra Como Voce Aprende
  {
    id: LESSON_IDS.l09,
    moduleId: MODULE_IDS.comoAprendo,
    title: "Estilos de Aprendizagem: Visual, Auditivo e Cinestetico",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l10,
    moduleId: MODULE_IDS.comoAprendo,
    title: "Quiz: Qual e o seu estilo?",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 2,
    status: "published" as const,
    xpReward: 75,
  },
  // M5: Memoria e Retencao
  {
    id: LESSON_IDS.l11,
    moduleId: MODULE_IDS.memoriaRetencao,
    title: "Repeticao Espacada: O Segredo dos Geniis",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l12,
    moduleId: MODULE_IDS.memoriaRetencao,
    title: "Mapas Mentais e Associacoes",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l13,
    moduleId: MODULE_IDS.memoriaRetencao,
    title: "Tecnica Feynman: Ensine para Aprender",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 3,
    status: "published" as const,
    xpReward: 50,
  },
  // M6: Estudo Ativo
  {
    id: LESSON_IDS.l14,
    moduleId: MODULE_IDS.estudoAtivo,
    title: "Anotacoes Eficientes: Cornell e Zettelkasten",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.l15,
    moduleId: MODULE_IDS.estudoAtivo,
    title: "Quiz: Estrategias de Estudo",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 2,
    status: "published" as const,
    xpReward: 75,
  },
  // M7: Entendendo o TDAH
  {
    id: LESSON_IDS.l16,
    moduleId: MODULE_IDS.entendendoTDAH,
    title: "TDAH nao e preguica: Mitos e Verdades",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l17,
    moduleId: MODULE_IDS.entendendoTDAH,
    title: "Os 3 Tipos de TDAH",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l18,
    moduleId: MODULE_IDS.entendendoTDAH,
    title: "Hiperfoco: Seu Superpoder Escondido",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 3,
    status: "published" as const,
    xpReward: 50,
  },
  // M8: Estrategias para o Dia a Dia
  {
    id: LESSON_IDS.l19,
    moduleId: MODULE_IDS.estrategiasdia,
    title: "Organizacao para Quem Odeia se Organizar",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l20,
    moduleId: MODULE_IDS.estrategiasdia,
    title: "Gerenciando Emocoes e Impulsividade",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.l21,
    moduleId: MODULE_IDS.estrategiasdia,
    title: "Quiz: Estrategias no Dia a Dia",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M9: Comunidade e Apoio
  {
    id: LESSON_IDS.l22,
    moduleId: MODULE_IDS.comunidadeApoio,
    title: "Voce nao esta sozinho: Redes de Apoio",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.l23,
    moduleId: MODULE_IDS.comunidadeApoio,
    title: "Proximos Passos na sua Jornada",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // ===================== Java do Zero à Primeira API =====================
  // M10: Introducao e Instalacao
  {
    id: LESSON_IDS.jl01,
    moduleId: MODULE_IDS.javaIntroInstalacao,
    title: "O que e Java e por que aprender?",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl02,
    moduleId: MODULE_IDS.javaIntroInstalacao,
    title: "Instalando o JDK e configurando o ambiente",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl03,
    moduleId: MODULE_IDS.javaIntroInstalacao,
    title: "Seu primeiro programa: Hello World!",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 3,
    status: "published" as const,
    xpReward: 60,
  },
  // M11: Variaveis e Tipos
  {
    id: LESSON_IDS.jl04,
    moduleId: MODULE_IDS.javaVariaveisTipos,
    title: "Variaveis: o que sao e como declarar",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl05,
    moduleId: MODULE_IDS.javaVariaveisTipos,
    title: "Tipos primitivos e operadores",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl06,
    moduleId: MODULE_IDS.javaVariaveisTipos,
    title: "Quiz: Variaveis e Tipos",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M12: Condicionais
  {
    id: LESSON_IDS.jl07,
    moduleId: MODULE_IDS.javaCondicionais,
    title: "if, else if e else na pratica",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl08,
    moduleId: MODULE_IDS.javaCondicionais,
    title: "switch-case e operador ternario",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M13: Loops
  {
    id: LESSON_IDS.jl09,
    moduleId: MODULE_IDS.javaLoops,
    title: "Loop for: repetindo com controle",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl10,
    moduleId: MODULE_IDS.javaLoops,
    title: "while e do-while: repetindo com condicao",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl11,
    moduleId: MODULE_IDS.javaLoops,
    title: "Quiz: Loops em Java",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M14: Arrays & Strings
  {
    id: LESSON_IDS.jl12,
    moduleId: MODULE_IDS.javaArraysStrings,
    title: "Arrays: armazenando multiplos valores",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl13,
    moduleId: MODULE_IDS.javaArraysStrings,
    title: "Strings: manipulacao de texto em Java",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M15: OOP Basico
  {
    id: LESSON_IDS.jl14,
    moduleId: MODULE_IDS.javaOopBasico,
    title: "Classes e Objetos: os pilares do Java",
    contentType: "text" as const,
    durationMinutes: 15,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl15,
    moduleId: MODULE_IDS.javaOopBasico,
    title: "Metodos, construtores e encapsulamento",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl16,
    moduleId: MODULE_IDS.javaOopBasico,
    title: "Quiz: OOP Basico",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M16: Heranca & Polimorfismo
  {
    id: LESSON_IDS.jl17,
    moduleId: MODULE_IDS.javaHerancaPoli,
    title: "Heranca: reutilizando codigo com extends",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl18,
    moduleId: MODULE_IDS.javaHerancaPoli,
    title: "Polimorfismo e interfaces",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl19,
    moduleId: MODULE_IDS.javaHerancaPoli,
    title: "Quiz: Heranca e Polimorfismo",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M17: Collections
  {
    id: LESSON_IDS.jl20,
    moduleId: MODULE_IDS.javaCollections,
    title: "List, ArrayList e LinkedList",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl21,
    moduleId: MODULE_IDS.javaCollections,
    title: "Set, Map e quando usar cada um",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M18: Excecoes
  {
    id: LESSON_IDS.jl22,
    moduleId: MODULE_IDS.javaExcecoes,
    title: "try-catch-finally: tratando erros com elegancia",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl23,
    moduleId: MODULE_IDS.javaExcecoes,
    title: "Excecoes customizadas e boas praticas",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M19: Spring Boot & API REST
  {
    id: LESSON_IDS.jl24,
    moduleId: MODULE_IDS.javaSpringApi,
    title: "O que e Spring Boot e por que usar?",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl25,
    moduleId: MODULE_IDS.javaSpringApi,
    title: "Criando seu primeiro projeto Spring Boot",
    contentType: "text" as const,
    durationMinutes: 15,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl26,
    moduleId: MODULE_IDS.javaSpringApi,
    title: "Construindo endpoints REST: GET, POST, PUT, DELETE",
    contentType: "text" as const,
    durationMinutes: 18,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  {
    id: LESSON_IDS.jl27,
    moduleId: MODULE_IDS.javaSpringApi,
    title: "Quiz Final: Java e Spring Boot",
    contentType: "quiz" as const,
    durationMinutes: 8,
    order: 4,
    status: "published" as const,
    xpReward: 100,
  },
  // ===================== Java from Zero to Your First API (English) =====================
  // M10en: Introduction and Setup
  {
    id: LESSON_IDS.jl01en,
    moduleId: MODULE_IDS.javaIntroInstalacaoEn,
    title: "What is Java and why learn it?",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl02en,
    moduleId: MODULE_IDS.javaIntroInstalacaoEn,
    title: "Installing the JDK and setting up your environment",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl03en,
    moduleId: MODULE_IDS.javaIntroInstalacaoEn,
    title: "Your first program: Hello World!",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 3,
    status: "published" as const,
    xpReward: 60,
  },
  // M11en: Variables and Data Types
  {
    id: LESSON_IDS.jl04en,
    moduleId: MODULE_IDS.javaVariaveisTiposEn,
    title: "Variables: what they are and how to declare them",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl05en,
    moduleId: MODULE_IDS.javaVariaveisTiposEn,
    title: "Primitive types and operators",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl06en,
    moduleId: MODULE_IDS.javaVariaveisTiposEn,
    title: "Quiz: Variables and Types",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M12en: Conditionals
  {
    id: LESSON_IDS.jl07en,
    moduleId: MODULE_IDS.javaCondicionaisEn,
    title: "if, else if and else in practice",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl08en,
    moduleId: MODULE_IDS.javaCondicionaisEn,
    title: "switch-case and ternary operator",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M13en: Loops
  {
    id: LESSON_IDS.jl09en,
    moduleId: MODULE_IDS.javaLoopsEn,
    title: "For loop: repeating with control",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl10en,
    moduleId: MODULE_IDS.javaLoopsEn,
    title: "while and do-while: repeating with a condition",
    contentType: "text" as const,
    durationMinutes: 8,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl11en,
    moduleId: MODULE_IDS.javaLoopsEn,
    title: "Quiz: Loops in Java",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M14en: Arrays & Strings
  {
    id: LESSON_IDS.jl12en,
    moduleId: MODULE_IDS.javaArraysStringsEn,
    title: "Arrays: storing multiple values",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl13en,
    moduleId: MODULE_IDS.javaArraysStringsEn,
    title: "Strings: text manipulation in Java",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M15en: OOP Basics
  {
    id: LESSON_IDS.jl14en,
    moduleId: MODULE_IDS.javaOopBasicoEn,
    title: "Classes and Objects: the pillars of Java",
    contentType: "text" as const,
    durationMinutes: 15,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl15en,
    moduleId: MODULE_IDS.javaOopBasicoEn,
    title: "Methods, constructors and encapsulation",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl16en,
    moduleId: MODULE_IDS.javaOopBasicoEn,
    title: "Quiz: OOP Basics",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M16en: Inheritance & Polymorphism
  {
    id: LESSON_IDS.jl17en,
    moduleId: MODULE_IDS.javaHerancaPoliEn,
    title: "Inheritance: reusing code with extends",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl18en,
    moduleId: MODULE_IDS.javaHerancaPoliEn,
    title: "Polymorphism and interfaces",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl19en,
    moduleId: MODULE_IDS.javaHerancaPoliEn,
    title: "Quiz: Inheritance and Polymorphism",
    contentType: "quiz" as const,
    durationMinutes: 5,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  // M17en: Collections
  {
    id: LESSON_IDS.jl20en,
    moduleId: MODULE_IDS.javaCollectionsEn,
    title: "List, ArrayList and LinkedList",
    contentType: "text" as const,
    durationMinutes: 12,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl21en,
    moduleId: MODULE_IDS.javaCollectionsEn,
    title: "Set, Map and when to use each one",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M18en: Exception Handling
  {
    id: LESSON_IDS.jl22en,
    moduleId: MODULE_IDS.javaExcecoesEn,
    title: "try-catch-finally: handling errors gracefully",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 50,
  },
  {
    id: LESSON_IDS.jl23en,
    moduleId: MODULE_IDS.javaExcecoesEn,
    title: "Custom exceptions and best practices",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 2,
    status: "published" as const,
    xpReward: 50,
  },
  // M19en: Spring Boot & REST API
  {
    id: LESSON_IDS.jl24en,
    moduleId: MODULE_IDS.javaSpringApiEn,
    title: "What is Spring Boot and why use it?",
    contentType: "text" as const,
    durationMinutes: 10,
    order: 1,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl25en,
    moduleId: MODULE_IDS.javaSpringApiEn,
    title: "Creating your first Spring Boot project",
    contentType: "text" as const,
    durationMinutes: 15,
    order: 2,
    status: "published" as const,
    xpReward: 60,
  },
  {
    id: LESSON_IDS.jl26en,
    moduleId: MODULE_IDS.javaSpringApiEn,
    title: "Building REST endpoints: GET, POST, PUT, DELETE",
    contentType: "text" as const,
    durationMinutes: 18,
    order: 3,
    status: "published" as const,
    xpReward: 75,
  },
  {
    id: LESSON_IDS.jl27en,
    moduleId: MODULE_IDS.javaSpringApiEn,
    title: "Final Quiz: Java and Spring Boot",
    contentType: "quiz" as const,
    durationMinutes: 8,
    order: 4,
    status: "published" as const,
    xpReward: 100,
  },
];

const SEED_LESSON_CONTENT: { lessonId: string; payload: object }[] = [
  // L01
  {
    lessonId: LESSON_IDS.l01,
    payload: {
      type: "text",
      markdown: `# O que e foco e por que ele foge?

Foco e a capacidade de direcionar sua atencao para uma tarefa especifica. Para pessoas com TDAH, manter o foco pode ser um desafio constante — mas nao e impossivel!

> 💡 **Dica:** Voce sabia? O foco nao e uma questao de forca de vontade. E uma funcao cerebral que pode ser treinada com as estrategias certas.

Nesta licao, vamos entender por que o foco parece 'fugir' e como o cerebro de uma pessoa neurodivergente processa informacoes de forma diferente.

# Por que e tao dificil focar?

- Dopamina: O cerebro com TDAH produz menos dopamina, o neurotransmissor da motivacao
- Filtro de relevancia: Seu cerebro tem dificuldade em filtrar o que e importante do que nao e
- Nocao de tempo: O tempo e percebido de forma diferente — tudo parece 'agora' ou 'nao agora'

Entender essas diferencas e o primeiro passo para criar estrategias que funcionem para VOCE.`,
    },
  },
  // L02
  {
    lessonId: LESSON_IDS.l02,
    payload: {
      type: "text",
      markdown: `# O cerebro e a atencao

Nosso cerebro funciona como uma orquestra. O cortex pre-frontal e o maestro que coordena tudo. No TDAH, esse maestro tem dificuldade em manter todos os musicos tocando juntos.

> 📝 **Nota:** O cortex pre-frontal e responsavel por: planejamento, controle de impulsos, memoria de trabalho e regulacao emocional.

Isso explica por que voce pode passar horas em algo que te interessa (hiperfoco) mas nao consegue dedicar 10 minutos a algo 'chato'. Nao e preguica — e neuroquimica!

# Tipos de Atencao

- Atencao sustentada: Manter o foco por longos periodos
- Atencao seletiva: Escolher no que focar em meio a distracao
- Atencao dividida: Fazer mais de uma coisa ao mesmo tempo
- Atencao alternada: Trocar o foco entre tarefas

Pessoas com TDAH geralmente tem mais dificuldade com atencao sustentada e seletiva, mas podem ser excelentes em atencao alternada!`,
    },
  },
  // L03 — Quiz
  {
    lessonId: LESSON_IDS.l03,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "O que e a dopamina?",
          type: "multiple_choice",
          options: [
            {
              id: "q1_a",
              text: "Um hormonio do sono",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_b",
              text: "Um neurotransmissor ligado a motivacao e recompensa",
              isCorrect: true,
              feedback:
                "Dopamina e o neurotransmissor responsavel pela sensacao de recompensa e motivacao. No TDAH, sua producao e regulacao sao diferentes.",
            },
            {
              id: "q1_c",
              text: "Uma vitamina essencial",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_d",
              text: "Um tipo de celula cerebral",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q2",
          text: "Por que pessoas com TDAH conseguem hiperfocar em jogos mas nao em tarefas chatas?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Porque sao preguicosas",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "Porque jogos liberam mais dopamina, ativando o sistema de recompensa",
              isCorrect: true,
              feedback:
                "Atividades estimulantes liberam mais dopamina, o que facilita a atencao. Nao e questao de vontade!",
            },
            {
              id: "q2_c",
              text: "Porque nao se esfor suficiente",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "Porque jogos sao mais faceis",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "Qual parte do cerebro e responsavel pelo planejamento e controle de impulsos?",
          type: "multiple_choice",
          options: [
            { id: "q3_a", text: "Cerebelo", isCorrect: false, feedback: "" },
            { id: "q3_b", text: "Hipocampo", isCorrect: false, feedback: "" },
            {
              id: "q3_c",
              text: "Cortex pre-frontal",
              isCorrect: true,
              feedback:
                "O cortex pre-frontal coordena funcoes executivas como planejamento, organizacao e controle de impulsos.",
            },
            { id: "q3_d", text: "Amigdala", isCorrect: false, feedback: "" },
          ],
        },
      ],
    },
  },
  // L04
  {
    lessonId: LESSON_IDS.l04,
    payload: {
      type: "text",
      markdown: `# Tecnica Pomodoro Adaptada

A Tecnica Pomodoro tradicional usa blocos de 25 minutos de trabalho + 5 minutos de pausa. Mas para quem tem TDAH, isso pode nao funcionar. Vamos adaptar!

> 💡 **Dica:** Comece com blocos de 10-15 minutos se 25 parecer demais. O importante e comecar, nao a duracao!

# Pomodoro para TDAH

- Comece com blocos de 10 min e aumente gradualmente
- Use pausas ativas: levante, alongue, beba agua
- Tenha um 'caderno de distracoes' — anote pensamentos intrusivos para resolver depois
- Use um timer visuel (ampulheta, app com barra de progresso)
- Recompense-se apos cada bloco completado

A chave e tornar o tempo tangivel. Pessoas com TDAH tem dificuldade com a percepcao temporal, entao ferramentas visuais fazem toda a diferenca.`,
    },
  },
  // L05
  {
    lessonId: LESSON_IDS.l05,
    payload: {
      type: "text",
      markdown: `# Body Doubling e Coworking Virtual

Body doubling e a pratica de ter outra pessoa presente enquanto voce trabalha. Pode ser presencialmente ou virtualmente. Muitas pessoas com TDAH acham muito mais facil focar quando alguem esta por perto.

> 📝 **Nota:** Estudos mostram que a presenca de outra pessoa ativa areas do cerebro ligadas a responsabilidade social, ajudando a manter o foco.

# Como Praticar

- Plataformas de coworking virtual (Focusmate, Flow Club)
- Estudar em cafes ou bibliotecas
- Ligar para um amigo e ficarem em silencio trabalhando juntos
- Lives de 'study with me' no YouTube`,
    },
  },
  // L06
  {
    lessonId: LESSON_IDS.l06,
    payload: {
      type: "text",
      markdown: `# Eliminando Distracoes Digitais

O celular e o maior inimigo do foco. Mas simplesmente 'ter disciplina' nao funciona para o cerebro TDAH. Vamos usar estrategias inteligentes!

# Estrategias Praticas

- Modo foco do celular: use-o ANTES de comecar a tarefa
- Extensoes como Freedom ou Cold Turkey para bloquear sites
- Coloque o celular em outro comodo (fora de vista = fora da mente)
- Desative TODAS as notificacoes nao essenciais
- Use fones de ouvido com ruido branco ou musica lo-fi

> 💡 **Dica:** Crie 'barreiras de atrito': quanto mais dificil for acessar a distracao, menos provavel que voce ceda.`,
    },
  },
  // L07
  {
    lessonId: LESSON_IDS.l07,
    payload: {
      type: "text",
      markdown: `# Montando uma Rotina Flexivel

Rotinas rigidas nao funcionam para cerebros TDAH. O segredo e criar uma estrutura flexivel que se adapte aos seus dias bons e ruins.

# Rotina em Blocos

Em vez de horarios fixos, use blocos tematicos:

- Bloco da manha: Autocuidado (cafe, higiene, movimento)
- Bloco produtivo: Sua tarefa mais importante (quando sua energia esta alta)
- Bloco criativo: Tarefas que exigem criatividade (geralmente a tarde)
- Bloco admin: E-mails, organizacao, tarefas chatas (em doses pequenas)
- Bloco descanso: Tempo livre sem culpa!

> 💡 **Dica:** Identifique SEU horario de pico de energia. Para muitas pessoas com TDAH, e no final da tarde ou a noite — e tudo bem!`,
    },
  },
  // L08 — Quiz
  {
    lessonId: LESSON_IDS.l08,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual e a duracao recomendada para comecar o Pomodoro adaptado?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "25 minutos", isCorrect: false, feedback: "" },
            { id: "q1_b", text: "45 minutos", isCorrect: false, feedback: "" },
            {
              id: "q1_c",
              text: "10-15 minutos",
              isCorrect: true,
              feedback:
                "Comecar com blocos menores (10-15 min) e mais realista e ajuda a construir o habito gradualmente.",
            },
            { id: "q1_d", text: "60 minutos", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "O que e body doubling?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Um exercicio fisico",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "Ter outra pessoa presente enquanto voce trabalha",
              isCorrect: true,
              feedback:
                "Body doubling e a presenca de outra pessoa (fisica ou virtual) que ajuda a manter a responsabilidade e o foco.",
            },
            {
              id: "q2_c",
              text: "Uma tecnica de meditacao",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "Fazer duas tarefas ao mesmo tempo",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // L09
  {
    lessonId: LESSON_IDS.l09,
    payload: {
      type: "text",
      markdown: `# Estilos de Aprendizagem

Cada pessoa aprende de um jeito diferente. Conhecer seu estilo dominante te ajuda a estudar de forma mais eficiente e prazerosa.

# Os Tres Estilos Principais

- Visual: Aprende melhor com imagens, graficos, cores e diagramas
- Auditivo: Aprende melhor ouvindo — podcasts, audiobooks, explicacoes verbais
- Cinestetico: Aprende melhor fazendo — pratica, movimento, experimentos

> 📝 **Nota:** A maioria das pessoas e multimodal (mistura de estilos). E pessoas com TDAH frequentemente se beneficiam de combinar multiplos estilos na mesma sessao de estudo!`,
    },
  },
  // L10 — Quiz
  {
    lessonId: LESSON_IDS.l10,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual estilo de aprendizagem se beneficia mais de mapas mentais coloridos?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "Auditivo", isCorrect: false, feedback: "" },
            { id: "q1_b", text: "Cinestetico", isCorrect: false, feedback: "" },
            {
              id: "q1_c",
              text: "Visual",
              isCorrect: true,
              feedback:
                "Aprendizes visuais retém melhor informacoes apresentadas em graficos, diagramas e mapas mentais com cores.",
            },
            { id: "q1_d", text: "Nenhum", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "Se voce aprende melhor caminhando enquanto ouve um audiobook, seu estilo dominante provavelmente e:",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "Visual", isCorrect: false, feedback: "" },
            {
              id: "q2_b",
              text: "Auditivo + Cinestetico",
              isCorrect: true,
              feedback:
                "Combinar movimento (cinestetico) com audio (auditivo) e uma estrategia multimodal muito eficaz!",
            },
            {
              id: "q2_c",
              text: "Apenas Auditivo",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "Apenas Visual",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // L11
  {
    lessonId: LESSON_IDS.l11,
    payload: {
      type: "text",
      markdown: `# Repeticao Espacada

Seu cerebro esquece informacoes em uma curva previsivel (Curva do Esquecimento de Ebbinghaus). A repeticao espacada combate isso revisando o conteudo em intervalos crescentes.

# Como Funciona

- Dia 1: Aprenda o conteudo
- Dia 2: Revise
- Dia 4: Revise novamente
- Dia 7: Mais uma revisao
- Dia 15: Revisao final — agora esta na memoria de longo prazo!

> 💡 **Dica:** Apps como Anki e Quizlet usam algoritmos de repeticao espacada automaticamente. Deixe a tecnologia trabalhar por voce!`,
    },
  },
  // L12
  {
    lessonId: LESSON_IDS.l12,
    payload: {
      type: "text",
      markdown: `# Mapas Mentais e Associacoes

O cerebro nao armazena informacoes em listas lineares — ele funciona por associacoes e conexoes. Mapas mentais imitam essa estrutura natural.

# Como Criar um Mapa Mental

- Coloque o tema central no meio da pagina
- Crie ramos para subtopicos principais
- Use cores diferentes para cada ramo
- Adicione desenhos e simbolos (nao precisa ser bonito!)
- Conecte ideias relacionadas com linhas

> 💡 **Dica:** Para TDAH, mapas mentais sao especialmente eficazes porque sao visuais, nao-lineares e permitem a mente 'pular' entre ideias.`,
    },
  },
  // L13
  {
    lessonId: LESSON_IDS.l13,
    payload: {
      type: "text",
      markdown: `# Tecnica Feynman: Ensine para Aprender

Richard Feynman, ganhador do Nobel de Fisica, acreditava que se voce nao consegue explicar algo de forma simples, voce nao entendeu de verdade.

# Os 4 Passos

- 1. Escolha um conceito
- 2. Explique como se estivesse ensinando uma crianca de 12 anos
- 3. Identifique lacunas no seu conhecimento
- 4. Revise e simplifique ainda mais

> 💡 **Dica:** Grave audios curtos explicando o que aprendeu. Alem de fixar o conteudo, voce cria material de revisao!`,
    },
  },
  // L14
  {
    lessonId: LESSON_IDS.l14,
    payload: {
      type: "text",
      markdown: `# Anotacoes Eficientes

Anotar tudo palavra por palavra nao funciona. Vamos aprender metodos de anotacao que realmente ajudam a aprender.

# Metodo Cornell

Divida a pagina em 3 areas: notas (direita), palavras-chave (esquerda) e resumo (embaixo). Isso forca voce a processar a informacao enquanto anota.

# Zettelkasten

Crie notas atomicas (uma ideia por nota) e conecte-as entre si. Perfeito para quem pensa de forma nao-linear — como a maioria das pessoas com TDAH!

> 💡 **Dica:** Use apps como Obsidian ou Notion para criar seu Zettelkasten digital com links entre notas.`,
    },
  },
  // L15 — Quiz
  {
    lessonId: LESSON_IDS.l15,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual e o intervalo ideal para a primeira revisao na repeticao espacada?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "1 hora", isCorrect: false, feedback: "" },
            {
              id: "q1_b",
              text: "1 dia",
              isCorrect: true,
              feedback:
                "A primeira revisao deve ocorrer no dia seguinte para combater a queda mais acentuada da Curva do Esquecimento.",
            },
            { id: "q1_c", text: "1 semana", isCorrect: false, feedback: "" },
            { id: "q1_d", text: "1 mes", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "Na Tecnica Feynman, para quem voce deve imaginar estar explicando?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Um professor universitario",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "Uma crianca de 12 anos",
              isCorrect: true,
              feedback:
                "Explicar de forma simples forca voce a realmente entender o conceito, sem se esconder atras de jargao.",
            },
            {
              id: "q2_c",
              text: "Um especialista na area",
              isCorrect: false,
              feedback: "",
            },
            { id: "q2_d", text: "Voce mesmo", isCorrect: false, feedback: "" },
          ],
        },
      ],
    },
  },
  // L16
  {
    lessonId: LESSON_IDS.l16,
    payload: {
      type: "text",
      markdown: `# TDAH nao e preguica

Um dos maiores mitos sobre TDAH e que e 'falta de vontade' ou 'preguica'. Na verdade, TDAH e um transtorno do neurodesenvolvimento que afeta o funcionamento executivo do cerebro.

# Mitos vs Verdades

- MITO: TDAH e so falta de disciplina → VERDADE: E uma diferenca neurobiologica real
- MITO: So criancas tem TDAH → VERDADE: 60% dos casos continuam na vida adulta
- MITO: Pessoas com TDAH nao conseguem focar em nada → VERDADE: Podem hiperfocar em assuntos de interesse
- MITO: TDAH e desculpa → VERDADE: E um diagnostico medico reconhecido pela OMS

> 📝 **Nota:** Estima-se que 5-8% da populacao mundial tem TDAH. Voce esta em boa companhia!`,
    },
  },
  // L17
  {
    lessonId: LESSON_IDS.l17,
    payload: {
      type: "text",
      markdown: `# Os 3 Tipos de TDAH

TDAH nao e um unico perfil. Existem tres apresentacoes principais, e entender a sua ajuda a escolher as melhores estrategias.

# Predominantemente Desatento

Dificuldade em manter atencao, esquecimentos frequentes, parece estar 'no mundo da lua'. Mais comum em mulheres e frequentemente nao diagnosticado.

# Predominantemente Hiperativo-Impulsivo

Inquietacao fisica, dificuldade em esperar a vez, fala excessiva, busca por sensacoes. Mais visivel e mais frequentemente diagnosticado na infancia.

# Combinado

Apresenta caracteristicas dos dois tipos. E a apresentacao mais comum.`,
    },
  },
  // L18
  {
    lessonId: LESSON_IDS.l18,
    payload: {
      type: "text",
      markdown: `# Hiperfoco: Seu Superpoder Escondido

O hiperfoco e a capacidade de se concentrar intensamente em algo por horas. Embora possa causar problemas (esquecer de comer, dormir), quando canalizado, e um superpoder.

# Como Usar o Hiperfoco a Seu Favor

- Identifique o que desencadeia seu hiperfoco (novidade? desafio? interesse?)
- Alinhe tarefas importantes com seus gatilhos de hiperfoco
- Use alarmes para 'sair' do hiperfoco quando necessario
- Transforme tarefas chatas em desafios ou jogos
- Use o inicio de um hiperfoco produtivo para atacar suas tarefas mais dificeis

> 💡 **Dica:** Muitos empreendedores, artistas e cientistas de sucesso tem TDAH. O hiperfoco e uma vantagem competitiva quando bem direcionado!`,
    },
  },
  // L19
  {
    lessonId: LESSON_IDS.l19,
    payload: {
      type: "text",
      markdown: `# Organizacao para Quem Odeia se Organizar

Organizacao tradicional (tudo no lugar, listas perfeitas, agenda impecavel) raramente funciona para TDAH. Vamos encontrar um sistema que funcione para SEU cerebro.

# Principios TDAH-friendly

- Se esta fora de vista, nao existe. Use organizacao visual (quadros, post-its, caixas transparentes)
- Uma caixa e melhor que uma gaveta. Jogue tudo relacionado em um unico lugar
- Capture TUDO em um lugar so (app de notas, caderno unico)
- Automatize o que puder (debito automatico, lembretes, rotinas no celular)
- Aceite o 'bom o suficiente' — perfeicao e inimiga do feito`,
    },
  },
  // L20
  {
    lessonId: LESSON_IDS.l20,
    payload: {
      type: "text",
      markdown: `# Gerenciando Emocoes e Impulsividade

A desregulacao emocional e um aspecto pouco falado do TDAH, mas afeta profundamente a vida diaria. Emocoes intensas, mudancas rapidas de humor e reacoes impulsivas sao comuns.

# Estrategias de Regulacao

- Pausa de 10 segundos: Antes de reagir, conte ate 10 e respire
- Nomeie a emocao: 'Estou sentindo frustacao' — nomear reduz a intensidade
- Movimento fisico: Caminhar, alongar ou apertar uma bolinha anti-stress
- Diario emocional: Registre padroes para se conhecer melhor
- Regra das 24h: Para decisoes grandes, espere 24h antes de agir

> 📝 **Nota:** A desregulacao emocional no TDAH e neurobiologica, nao um defeito de carater. Seja gentil consigo mesmo enquanto aprende a gerencia-la.`,
    },
  },
  // L21 — Quiz
  {
    lessonId: LESSON_IDS.l21,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual principio de organizacao funciona melhor para TDAH?",
          type: "multiple_choice",
          options: [
            {
              id: "q1_a",
              text: "Guardar tudo em gavetas organizadas",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_b",
              text: "Se esta fora de vista, nao existe — use organizacao visual",
              isCorrect: true,
              feedback:
                "Pessoas com TDAH se beneficiam de organizacao visual porque o que esta 'fora de vista' tende a ser esquecido.",
            },
            {
              id: "q1_c",
              text: "Fazer listas detalhadas todo dia",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_d",
              text: "Memorizar compromissos",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q2",
          text: "O que e a 'regra das 24h' para impulsividade?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Dormir 24h por dia",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "Esperar 24h antes de tomar decisoes grandes",
              isCorrect: true,
              feedback:
                "Esperar 24h permite que a reacao emocional/impulsiva diminua, levando a decisoes mais ponderadas.",
            },
            {
              id: "q2_c",
              text: "Fazer exercicio por 24 minutos",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "Planejar as proximas 24h",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // L22
  {
    lessonId: LESSON_IDS.l22,
    payload: {
      type: "text",
      markdown: `# Voce nao esta sozinho

Viver com TDAH pode ser solitario, especialmente quando as pessoas ao redor nao entendem seus desafios. Mas existem comunidades inteiras de pessoas que passam pelas mesmas experiencias.

# Onde Encontrar Apoio

- Grupos de apoio online (Reddit r/TDAH_Brasil, grupos no Facebook)
- Associacoes como a ABDA (Associacao Brasileira do Deficit de Atencao)
- Psicologos e psiquiatras especializados em TDAH adulto
- Coaching para TDAH — profissionais que ajudam com estrategias praticas
- Comunidade FocusQuest — voce ja esta aqui!

> 💡 **Dica:** Compartilhar experiencias com quem entende e terapeutico. Nao tenha medo de pedir ajuda.`,
    },
  },
  // L23
  {
    lessonId: LESSON_IDS.l23,
    payload: {
      type: "text",
      markdown: `# Proximos Passos na sua Jornada

Parabens por chegar ate aqui! Completar este curso ja e uma grande conquista. Agora vamos definir seus proximos passos.

# Seu Plano de Acao

- Escolha UMA estrategia deste curso para implementar esta semana
- Nao tente mudar tudo de uma vez — pequenos passos consistentes vencem
- Revise este material daqui a uma semana (repeticao espacada!)
- Continue sua trilha de aprendizado no FocusQuest
- Celebre cada pequena vitoria — voce merece!

> 💡 **Dica:** O progresso nao e linear. Tera dias bons e ruins. O importante e nao desistir. Voce ja deu o passo mais importante: comecar.

Nos vemos na proxima trilha! Continue acumulando XP e desbloqueando conquistas. Sua jornada esta apenas comecando.`,
    },
  },
  // JL01 — O que e Java e por que aprender?
  {
    lessonId: LESSON_IDS.jl01,
    payload: {
      type: "text",
      markdown: `# O que e Java e por que aprender?

Java e uma das linguagens de programacao mais populares do mundo. Criada em 1995 pela Sun Microsystems, ela e usada em tudo: apps Android, sistemas bancarios, e-commerces e muito mais.

> 📝 **Nota:** O lema do Java e 'Write Once, Run Anywhere' (Escreva uma vez, rode em qualquer lugar). Isso porque o codigo Java roda dentro da JVM (Java Virtual Machine), que existe para Windows, Mac e Linux.

# Por que Java e otimo para iniciantes?

- Sintaxe clara e estruturada — te forca a organizar o codigo
- Fortemente tipada — o compilador te avisa de erros ANTES de rodar
- Comunidade gigante — sempre vai ter alguem para te ajudar
- Mercado de trabalho enorme — Java esta no top 3 de linguagens mais pedidas
- Base solida — aprender Java facilita migrar para Kotlin, C#, e outras

Neste curso, voce vai sair do zero absoluto ate construir uma API REST funcional. Vamos nessa!`,
    },
  },
  // JL02 — Instalando o JDK
  {
    lessonId: LESSON_IDS.jl02,
    payload: {
      type: "text",
      markdown: `# Instalando o JDK e configurando o ambiente

Para programar em Java, voce precisa instalar o JDK (Java Development Kit). Ele inclui o compilador (javac) e a JVM para rodar seus programas.

# Passo a Passo

- 1. Acesse https://adoptium.net e baixe o JDK 21 (LTS) para seu sistema operacional
- 2. Instale seguindo o assistente padrao (Next, Next, Finish)
- 3. Abra o terminal e digite: java --version
- 4. Se aparecer a versao, parabens! Java esta instalado

# Escolhendo uma IDE

Uma IDE facilita muito a vida. Recomendamos:

- IntelliJ IDEA Community (gratis) — a mais popular para Java
- VS Code com extensao 'Extension Pack for Java' — leve e versatil
- Eclipse — classico, mas um pouco mais pesado

> 💡 **Dica:** Para iniciantes, o VS Code com extensoes Java e a opcao mais leve. Se seu computador aguenta, o IntelliJ e imbativel!

\`\`\`bash
# Verificar se o Java esta instalado
java --version

# Deve aparecer algo como:
# openjdk 21.0.2 2024-01-16
# OpenJDK Runtime Environment Temurin-21.0.2+13
\`\`\``,
    },
  },
  // JL03 — Hello World
  {
    lessonId: LESSON_IDS.jl03,
    payload: {
      type: "text",
      markdown: `# Seu primeiro programa: Hello World!

Todo programador comeca assim. Vamos criar seu primeiro arquivo Java e rodar no terminal.

# O Codigo

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Ola, mundo! Eu estou programando em Java!");
    }
}
\`\`\`

# Entendendo cada parte

- public class HelloWorld — define uma classe chamada HelloWorld. Em Java, TUDO fica dentro de classes.
- public static void main(String[] args) — o metodo main e o ponto de entrada do programa. Java sempre comeca aqui.
- System.out.println(...) — imprime texto no terminal. println adiciona uma quebra de linha no final.

# Compilando e rodando

\`\`\`bash
# Salve o arquivo como HelloWorld.java
# O nome do arquivo DEVE ser igual ao nome da classe!

# Compilar:
javac HelloWorld.java

# Rodar:
java HelloWorld

# Saida: Ola, mundo! Eu estou programando em Java!
\`\`\`

> 💡 **Dica:** Em Java, o nome do arquivo .java precisa ser EXATAMENTE igual ao nome da classe publica. Se a classe e HelloWorld, o arquivo deve ser HelloWorld.java.`,
    },
  },
  // JL04 — Variaveis
  {
    lessonId: LESSON_IDS.jl04,
    payload: {
      type: "text",
      markdown: `# Variaveis: o que sao e como declarar

Variaveis sao como caixas rotuladas onde voce guarda informacoes. Em Java, voce precisa dizer o TIPO da informacao antes de usa-la.

# Declarando variaveis

\`\`\`java
// tipo nome = valor;
int idade = 25;
String nome = "Maria";
double altura = 1.65;
boolean estudante = true;

System.out.println("Nome: " + nome);
System.out.println("Idade: " + idade);
System.out.println("Altura: " + altura);
System.out.println("Estudante: " + estudante);
\`\`\`

# Regras para nomes de variaveis

- Comece com letra minuscula (camelCase): minhaIdade, nomeCompleto
- Nao pode comecar com numero: 2nome (errado), nome2 (certo)
- Nao pode usar palavras reservadas: int, class, public, etc.
- Use nomes descritivos: saldo e melhor que s

> 💡 **Dica:** Java e 'case-sensitive': idade, Idade e IDADE sao tres variaveis diferentes!`,
    },
  },
  // JL05 — Tipos primitivos e operadores
  {
    lessonId: LESSON_IDS.jl05,
    payload: {
      type: "text",
      markdown: `# Tipos primitivos e operadores

Java tem 8 tipos primitivos. Os mais usados no dia a dia sao: int, double, boolean e char.

# Tipos primitivos

\`\`\`java
// Inteiros
byte pequeno = 127;          // -128 a 127
short medio = 32000;          // -32768 a 32767
int normal = 2000000000;      // ~-2bi a ~2bi
long grande = 9000000000L;    // muito grande (note o L)

// Decimais
float decimal = 3.14f;        // precisao simples (note o f)
double preciso = 3.14159265;  // precisao dupla (padrao)

// Outros
boolean ativo = true;         // true ou false
char letra = 'A';             // um unico caractere (aspas simples!)
\`\`\`

# Operadores

\`\`\`java
// Aritmeticos
int soma = 10 + 3;      // 13
int sub = 10 - 3;       // 7
int mult = 10 * 3;      // 30
int div = 10 / 3;       // 3 (divisao inteira!)
int resto = 10 % 3;     // 1 (modulo)

// Comparacao (retornam boolean)
boolean igual = (10 == 10);    // true
boolean diferente = (10 != 5); // true
boolean maior = (10 > 5);     // true
boolean menorIgual = (10 <= 10); // true

// Logicos
boolean e = true && false;   // false (AND)
boolean ou = true || false;  // true (OR)
boolean nao = !true;         // false (NOT)
\`\`\`

> 📝 **Nota:** Cuidado: 10 / 3 = 3 em Java (divisao inteira!). Para obter 3.33, use 10.0 / 3 ou faca cast: (double) 10 / 3.`,
    },
  },
  // JL06 — Quiz Variaveis e Tipos
  {
    lessonId: LESSON_IDS.jl06,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual tipo primitivo voce usaria para armazenar o valor 3.14?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "int", isCorrect: false, feedback: "" },
            { id: "q1_b", text: "String", isCorrect: false, feedback: "" },
            {
              id: "q1_c",
              text: "double",
              isCorrect: true,
              feedback:
                "double e o tipo padrao para numeros decimais em Java. float tambem funciona, mas precisa do sufixo 'f'.",
            },
            { id: "q1_d", text: "boolean", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "Qual e o resultado de 10 / 3 em Java?",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "3.33", isCorrect: false, feedback: "" },
            {
              id: "q2_b",
              text: "3",
              isCorrect: true,
              feedback:
                "Quando ambos os operandos sao int, Java faz divisao inteira. 10 / 3 = 3 (trunca o decimal).",
            },
            { id: "q2_c", text: "4", isCorrect: false, feedback: "" },
            {
              id: "q2_d",
              text: "Erro de compilacao",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "Qual nome de variavel e valido em Java?",
          type: "multiple_choice",
          options: [
            { id: "q3_a", text: "2nome", isCorrect: false, feedback: "" },
            { id: "q3_b", text: "meu-nome", isCorrect: false, feedback: "" },
            {
              id: "q3_c",
              text: "meu_nome",
              isCorrect: true,
              feedback:
                "meu_nome e valido. Nomes nao podem comecar com numero, ter hifen, ou usar palavras reservadas como 'class'.",
            },
            { id: "q3_d", text: "class", isCorrect: false, feedback: "" },
          ],
        },
      ],
    },
  },
  // JL07 — if, else if e else
  {
    lessonId: LESSON_IDS.jl07,
    payload: {
      type: "text",
      markdown: `# if, else if e else na pratica

Condicionais permitem que seu programa tome decisoes. E como na vida: SE estiver chovendo, leve guarda-chuva. SENAO, leve oculos de sol.

# Estrutura basica

\`\`\`java
int nota = 85;

if (nota >= 90) {
    System.out.println("Conceito A — Excelente!");
} else if (nota >= 70) {
    System.out.println("Conceito B — Bom!");
} else if (nota >= 50) {
    System.out.println("Conceito C — Regular");
} else {
    System.out.println("Conceito D — Precisa melhorar");
}
// Saida: Conceito B — Bom!
\`\`\`

# Dicas importantes

- A condicao dentro do if DEVE ser boolean (true ou false)
- Use == para comparar numeros, .equals() para comparar Strings
- Sempre use chaves {} mesmo com uma linha so — evita bugs
- Java avalia de cima para baixo e PARA na primeira condicao verdadeira

\`\`\`java
// Comparando Strings — CUIDADO!
String cor = "azul";

// ERRADO (compara referencia, nao conteudo):
if (cor == "azul") { ... }

// CERTO (compara o conteudo):
if (cor.equals("azul")) {
    System.out.println("Cor favorita: azul!");
}
\`\`\`

> 💡 **Dica:** Para TDAH: pense em condicionais como 'arvores de decisao'. Desenhe no papel antes de codar — facilita muito!`,
    },
  },
  // JL08 — switch-case e ternario
  {
    lessonId: LESSON_IDS.jl08,
    payload: {
      type: "text",
      markdown: `# switch-case e operador ternario

Quando voce tem MUITAS condicoes para a mesma variavel, o switch e mais limpo que varios if/else.

# switch tradicional

\`\`\`java
int diaSemana = 3;

switch (diaSemana) {
    case 1:
        System.out.println("Segunda");
        break;
    case 2:
        System.out.println("Terca");
        break;
    case 3:
        System.out.println("Quarta");
        break;
    default:
        System.out.println("Outro dia");
}
// Saida: Quarta
\`\`\`

# switch moderno (Java 14+)

\`\`\`java
String dia = switch (diaSemana) {
    case 1 -> "Segunda";
    case 2 -> "Terca";
    case 3 -> "Quarta";
    case 4 -> "Quinta";
    case 5 -> "Sexta";
    default -> "Fim de semana";
};
System.out.println(dia); // Quarta
\`\`\`

# Operador ternario

\`\`\`java
// condicao ? valorSeTrue : valorSeFalse
int idade = 20;
String status = (idade >= 18) ? "Maior de idade" : "Menor de idade";
System.out.println(status); // Maior de idade
\`\`\`

> 📝 **Nota:** O ternario e otimo para atribuicoes simples. Para logica complexa, prefira if/else — legibilidade importa!`,
    },
  },
  // JL09 — Loop for
  {
    lessonId: LESSON_IDS.jl09,
    payload: {
      type: "text",
      markdown: `# Loop for: repetindo com controle

O loop for e usado quando voce sabe QUANTAS vezes quer repetir algo. E o loop mais usado em Java.

# Estrutura do for

\`\`\`java
// for (inicio; condicao; incremento)
for (int i = 1; i <= 5; i++) {
    System.out.println("Contagem: " + i);
}
// Saida:
// Contagem: 1
// Contagem: 2
// Contagem: 3
// Contagem: 4
// Contagem: 5
\`\`\`

# for-each (for aprimorado)

\`\`\`java
String[] frutas = {"Maca", "Banana", "Laranja"};

for (String fruta : frutas) {
    System.out.println("Fruta: " + fruta);
}
// Saida:
// Fruta: Maca
// Fruta: Banana
// Fruta: Laranja
\`\`\`

> 💡 **Dica:** Use o for classico quando precisar do indice (i). Use o for-each quando so precisa do valor — e mais limpo e menos propenso a erros!

# break e continue

\`\`\`java
for (int i = 1; i <= 10; i++) {
    if (i == 5) break;    // para o loop quando i = 5
    if (i % 2 == 0) continue; // pula numeros pares
    System.out.println(i);    // imprime: 1, 3
}
\`\`\``,
    },
  },
  // JL10 — while e do-while
  {
    lessonId: LESSON_IDS.jl10,
    payload: {
      type: "text",
      markdown: `# while e do-while: repetindo com condicao

Use while quando NAO sabe quantas vezes vai repetir — so sabe a condicao de parada.

# while

\`\`\`java
int tentativas = 0;
int senha = 1234;
int tentativa = 0;

while (tentativa != senha && tentativas < 3) {
    // Simula tentativa
    tentativa = 1111; // na pratica, viria do usuario
    tentativas++;
    System.out.println("Tentativa " + tentativas);
}

if (tentativa == senha) {
    System.out.println("Senha correta!");
} else {
    System.out.println("Bloqueado apos 3 tentativas");
}
\`\`\`

# do-while

A diferenca: do-while executa o bloco PELO MENOS UMA VEZ antes de verificar a condicao.

\`\`\`java
int numero;
do {
    numero = (int) (Math.random() * 10); // 0 a 9
    System.out.println("Numero sorteado: " + numero);
} while (numero != 7);

System.out.println("Encontrou o 7!");
\`\`\`

> 📝 **Nota:** Cuidado com loops infinitos! Sempre garanta que a condicao eventualmente se tornara false. Se travar, Ctrl+C no terminal para parar.`,
    },
  },
  // JL11 — Quiz Loops
  {
    lessonId: LESSON_IDS.jl11,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual loop voce usaria quando sabe exatamente quantas vezes quer repetir?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "while", isCorrect: false, feedback: "" },
            { id: "q1_b", text: "do-while", isCorrect: false, feedback: "" },
            {
              id: "q1_c",
              text: "for",
              isCorrect: true,
              feedback:
                "O for e ideal quando o numero de iteracoes e conhecido: for (int i = 0; i < n; i++).",
            },
            { id: "q1_d", text: "if-else", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "Qual e a diferenca entre while e do-while?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Nao ha diferenca",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "do-while executa pelo menos uma vez antes de verificar a condicao",
              isCorrect: true,
              feedback:
                "O do-while verifica a condicao DEPOIS de executar o bloco, garantindo pelo menos uma execucao.",
            },
            {
              id: "q2_c",
              text: "while e mais rapido",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "do-while nao aceita break",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "O que faz o comando 'continue' dentro de um loop?",
          type: "multiple_choice",
          options: [
            {
              id: "q3_a",
              text: "Para o loop completamente",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_b",
              text: "Pula para a proxima iteracao",
              isCorrect: true,
              feedback:
                "continue pula o restante do bloco atual e vai direto para a proxima iteracao do loop.",
            },
            {
              id: "q3_c",
              text: "Repete a iteracao atual",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_d",
              text: "Sai do programa",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // JL12 — Arrays
  {
    lessonId: LESSON_IDS.jl12,
    payload: {
      type: "text",
      markdown: `# Arrays: armazenando multiplos valores

Um array e uma estrutura que armazena varios valores do MESMO tipo em sequencia. Pense como uma fileira de caixas numeradas.

# Criando arrays

\`\`\`java
// Forma 1: declarar e inicializar
int[] notas = {85, 92, 78, 95, 88};

// Forma 2: declarar tamanho fixo
String[] nomes = new String[3];
nomes[0] = "Ana";
nomes[1] = "Bruno";
nomes[2] = "Carla";

// Acessando valores
System.out.println(notas[0]);    // 85 (primeiro elemento)
System.out.println(notas[4]);    // 88 (ultimo elemento)
System.out.println(notas.length); // 5 (tamanho do array)
\`\`\`

# Percorrendo arrays

\`\`\`java
int[] numeros = {10, 20, 30, 40, 50};

// Com for classico
for (int i = 0; i < numeros.length; i++) {
    System.out.println("Indice " + i + ": " + numeros[i]);
}

// Com for-each (mais limpo)
for (int n : numeros) {
    System.out.println("Valor: " + n);
}
\`\`\`

> 📝 **Nota:** Arrays em Java comecam no indice 0! Se o array tem 5 elementos, os indices vao de 0 a 4. Acessar indice 5 causa ArrayIndexOutOfBoundsException.

> 💡 **Dica:** Arrays tem tamanho FIXO. Se precisar de algo que cresce dinamicamente, use ArrayList (veremos em breve!).`,
    },
  },
  // JL13 — Strings
  {
    lessonId: LESSON_IDS.jl13,
    payload: {
      type: "text",
      markdown: `# Strings: manipulacao de texto em Java

String e o tipo mais usado em Java para texto. Embora nao seja um tipo primitivo (e uma classe), Java trata Strings de forma especial.

# Metodos uteis de String

\`\`\`java
String nome = "Maria Silva";

System.out.println(nome.length());          // 11
System.out.println(nome.toUpperCase());     // MARIA SILVA
System.out.println(nome.toLowerCase());     // maria silva
System.out.println(nome.trim());            // remove espacos extras
System.out.println(nome.contains("Silva")); // true
System.out.println(nome.startsWith("Mar")); // true
System.out.println(nome.substring(0, 5));   // Maria
System.out.println(nome.replace("Silva", "Santos")); // Maria Santos
System.out.println(nome.charAt(0));         // M
\`\`\`

# Concatenacao e formatacao

\`\`\`java
// Concatenacao com +
String saudacao = "Ola, " + nome + "!";

// String.format (mais limpo para multiplas variaveis)
int idade = 25;
String msg = String.format("Nome: %s, Idade: %d", nome, idade);

// Text blocks (Java 15+) — otimo para textos longos
String json = """
        {
            "nome": "Maria",
            "idade": 25
        }
        """;
\`\`\`

> 💡 **Dica:** NUNCA compare Strings com ==. Sempre use .equals(). O == compara se sao o mesmo objeto na memoria, nao se o conteudo e igual!`,
    },
  },
  // JL14 — Classes e Objetos
  {
    lessonId: LESSON_IDS.jl14,
    payload: {
      type: "text",
      markdown: `# Classes e Objetos: os pilares do Java

Java e uma linguagem orientada a objetos (OOP). Isso significa que tudo gira em torno de CLASSES (moldes) e OBJETOS (instancias desses moldes).

> 📝 **Nota:** Pense assim: uma CLASSE e a planta de uma casa. Um OBJETO e a casa construida a partir dessa planta. Voce pode construir varias casas (objetos) a partir da mesma planta (classe).

# Criando uma classe

\`\`\`java
public class Aluno {
    // Atributos (caracteristicas)
    String nome;
    int idade;
    double nota;

    // Metodo (comportamento)
    void apresentar() {
        System.out.println("Oi, eu sou " + nome + " e tenho " + idade + " anos.");
    }

    void estudar(String materia) {
        System.out.println(nome + " esta estudando " + materia);
    }
}
\`\`\`

# Criando e usando objetos

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // Criando um objeto
        Aluno aluno1 = new Aluno();
        aluno1.nome = "Pedro";
        aluno1.idade = 22;
        aluno1.nota = 8.5;

        Aluno aluno2 = new Aluno();
        aluno2.nome = "Ana";
        aluno2.idade = 20;
        aluno2.nota = 9.2;

        aluno1.apresentar(); // Oi, eu sou Pedro e tenho 22 anos.
        aluno2.estudar("Java"); // Ana esta estudando Java
    }
}
\`\`\`

> 💡 **Dica:** Cada objeto tem sua propria copia dos atributos. Mudar o nome de aluno1 NAO afeta aluno2. Sao instancias independentes!`,
    },
  },
  // JL15 — Metodos, construtores e encapsulamento
  {
    lessonId: LESSON_IDS.jl15,
    payload: {
      type: "text",
      markdown: `# Metodos, construtores e encapsulamento

Agora vamos aprimorar nossas classes com construtores (para inicializar objetos de forma limpa) e encapsulamento (para proteger os dados).

# Construtores

\`\`\`java
public class Aluno {
    private String nome;
    private int idade;
    private double nota;

    // Construtor — mesmo nome da classe, sem tipo de retorno
    public Aluno(String nome, int idade, double nota) {
        this.nome = nome;   // this diferencia atributo do parametro
        this.idade = idade;
        this.nota = nota;
    }

    // Construtor sem argumentos (sobrecarga)
    public Aluno() {
        this.nome = "Sem nome";
        this.idade = 0;
        this.nota = 0.0;
    }
}
\`\`\`

# Encapsulamento: getters e setters

\`\`\`java
public class Aluno {
    private String nome;
    private double nota;

    public Aluno(String nome, double nota) {
        this.nome = nome;
        setNota(nota); // usa o setter para validar
    }

    // Getter — permite LER o valor
    public String getNome() {
        return nome;
    }

    // Setter — permite ALTERAR com validacao
    public void setNota(double nota) {
        if (nota < 0 || nota > 10) {
            throw new IllegalArgumentException("Nota deve ser entre 0 e 10");
        }
        this.nota = nota;
    }

    public double getNota() {
        return nota;
    }
}
\`\`\`

> 📝 **Nota:** Encapsulamento = atributos private + acesso via getters/setters. Isso protege seus dados e permite validacao. E um dos pilares da OOP!`,
    },
  },
  // JL16 — Quiz OOP Basico
  {
    lessonId: LESSON_IDS.jl16,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual e a diferenca entre uma classe e um objeto?",
          type: "multiple_choice",
          options: [
            {
              id: "q1_a",
              text: "Nao ha diferenca",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_b",
              text: "Classe e o molde/planta, objeto e a instancia criada a partir dela",
              isCorrect: true,
              feedback:
                "A classe define a estrutura (atributos e metodos). O objeto e uma instancia concreta criada com 'new'.",
            },
            {
              id: "q1_c",
              text: "Objeto e o molde, classe e a instancia",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_d",
              text: "Classes so existem em Java",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q2",
          text: "O que faz a palavra-chave 'this' em Java?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Cria um novo objeto",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "Refere-se ao objeto atual da classe",
              isCorrect: true,
              feedback:
                "this refere-se a instancia atual do objeto. E usado para desambiguar quando parametro e atributo tem o mesmo nome.",
            },
            {
              id: "q2_c",
              text: "Importa uma biblioteca",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "Define um tipo generico",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "Por que usamos atributos private com getters e setters?",
          type: "multiple_choice",
          options: [
            {
              id: "q3_a",
              text: "Para o codigo ficar mais longo",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_b",
              text: "Para encapsular e proteger os dados, permitindo validacao",
              isCorrect: true,
              feedback:
                "Encapsulamento protege os dados e permite adicionar logica de validacao nos setters antes de alterar os valores.",
            },
            {
              id: "q3_c",
              text: "Porque Java obriga",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_d",
              text: "Para o programa rodar mais rapido",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // JL17 — Heranca
  {
    lessonId: LESSON_IDS.jl17,
    payload: {
      type: "text",
      markdown: `# Heranca: reutilizando codigo com extends

Heranca permite criar novas classes baseadas em classes existentes, reaproveitando codigo. A classe filha HERDA atributos e metodos da classe pai.

# Exemplo pratico

\`\`\`java
// Classe pai (superclasse)
public class Animal {
    protected String nome;
    protected int idade;

    public Animal(String nome, int idade) {
        this.nome = nome;
        this.idade = idade;
    }

    public void comer() {
        System.out.println(nome + " esta comendo");
    }

    public void dormir() {
        System.out.println(nome + " esta dormindo");
    }
}

// Classe filha (subclasse)
public class Cachorro extends Animal {
    private String raca;

    public Cachorro(String nome, int idade, String raca) {
        super(nome, idade); // chama construtor do pai
        this.raca = raca;
    }

    public void latir() {
        System.out.println(nome + " diz: Au au!");
    }
}

// Uso:
Cachorro rex = new Cachorro("Rex", 3, "Labrador");
rex.comer();  // herdado de Animal
rex.dormir(); // herdado de Animal
rex.latir();  // proprio de Cachorro
\`\`\`

# Sobrescrita de metodos (@Override)

\`\`\`java
public class Gato extends Animal {
    public Gato(String nome, int idade) {
        super(nome, idade);
    }

    @Override
    public void comer() {
        System.out.println(nome + " esta comendo racao de gato");
    }
}

// Uso:
Gato mimi = new Gato("Mimi", 2);
mimi.comer(); // Mimi esta comendo racao de gato (versao sobrescrita!)
\`\`\`

> 💡 **Dica:** Use @Override sempre que sobrescrever um metodo. O compilador verifica se voce realmente esta sobrescrevendo algo — evita erros de digitacao!`,
    },
  },
  // JL18 — Polimorfismo e interfaces
  {
    lessonId: LESSON_IDS.jl18,
    payload: {
      type: "text",
      markdown: `# Polimorfismo e interfaces

Polimorfismo significa 'muitas formas'. Em Java, voce pode tratar objetos filhos como se fossem do tipo pai. Isso torna o codigo flexivel e extensivel.

# Polimorfismo em acao

\`\`\`java
// Podemos usar o tipo pai para referenciar objetos filhos
Animal animal1 = new Cachorro("Rex", 3, "Labrador");
Animal animal2 = new Gato("Mimi", 2);

// O metodo chamado depende do TIPO REAL do objeto
animal1.comer(); // Rex esta comendo (metodo de Animal, pois Cachorro nao sobrescreveu)
animal2.comer(); // Mimi esta comendo racao de gato (metodo sobrescrito)
\`\`\`

# Interfaces

Uma interface e um contrato. Ela define QUAIS metodos uma classe deve ter, mas nao diz COMO implementar.

\`\`\`java
// Interface
public interface Pagavel {
    double calcularPagamento();
    String getDescricao();
}

// Implementacao
public class Freelancer implements Pagavel {
    private String nome;
    private double valorHora;
    private int horas;

    public Freelancer(String nome, double valorHora, int horas) {
        this.nome = nome;
        this.valorHora = valorHora;
        this.horas = horas;
    }

    @Override
    public double calcularPagamento() {
        return valorHora * horas;
    }

    @Override
    public String getDescricao() {
        return "Freelancer: " + nome;
    }
}
\`\`\`

> 📝 **Nota:** Uma classe so pode herdar de UMA classe (extends), mas pode implementar VARIAS interfaces (implements). Interfaces sao como 'habilidades' que uma classe pode ter.`,
    },
  },
  // JL19 — Quiz Heranca e Polimorfismo
  {
    lessonId: LESSON_IDS.jl19,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "O que a palavra-chave 'super' faz em um construtor de classe filha?",
          type: "multiple_choice",
          options: [
            {
              id: "q1_a",
              text: "Cria um novo objeto da classe pai",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_b",
              text: "Chama o construtor da classe pai (superclasse)",
              isCorrect: true,
              feedback:
                "super() chama o construtor da classe pai, permitindo inicializar os atributos herdados.",
            },
            {
              id: "q1_c",
              text: "Define a classe como superior",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_d",
              text: "Importa metodos de outra classe",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q2",
          text: "Uma classe pode implementar quantas interfaces?",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "Apenas 1", isCorrect: false, feedback: "" },
            { id: "q2_b", text: "Apenas 2", isCorrect: false, feedback: "" },
            {
              id: "q2_c",
              text: "Quantas quiser",
              isCorrect: true,
              feedback:
                "Java permite implementar multiplas interfaces (diferente de heranca, que e limitada a uma classe pai).",
            },
            {
              id: "q2_d",
              text: "Nenhuma, interfaces nao existem em Java",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // JL20 — List, ArrayList e LinkedList
  {
    lessonId: LESSON_IDS.jl20,
    payload: {
      type: "text",
      markdown: `# List, ArrayList e LinkedList

Diferente de arrays, Collections em Java podem crescer e diminuir dinamicamente. A mais usada e o ArrayList — pense nele como um array que cresce sozinho!

# ArrayList na pratica

\`\`\`java
import java.util.ArrayList;
import java.util.List;

List<String> nomes = new ArrayList<>();

// Adicionar
nomes.add("Ana");
nomes.add("Bruno");
nomes.add("Carla");

// Acessar
System.out.println(nomes.get(0));  // Ana
System.out.println(nomes.size());  // 3

// Remover
nomes.remove("Bruno");
System.out.println(nomes); // [Ana, Carla]

// Verificar
System.out.println(nomes.contains("Ana")); // true

// Percorrer
for (String nome : nomes) {
    System.out.println("Nome: " + nome);
}
\`\`\`

# ArrayList vs LinkedList

- ArrayList: acesso rapido por indice (get), insercao/remocao no meio e lenta
- LinkedList: insercao/remocao rapida em qualquer posicao, acesso por indice e lento
- Na pratica: use ArrayList em 95% dos casos. So use LinkedList se fizer MUITAS insercoes/remocoes no meio da lista.

> 💡 **Dica:** Declare como List<> (interface) e inicialize como ArrayList<> (implementacao). Assim voce pode trocar para LinkedList depois sem mudar o resto do codigo!`,
    },
  },
  // JL21 — Set, Map e quando usar cada um
  {
    lessonId: LESSON_IDS.jl21,
    payload: {
      type: "text",
      markdown: `# Set, Map e quando usar cada um

Alem de List, Java tem Set (conjunto sem duplicatas) e Map (pares chave-valor). Saber quando usar cada um e essencial!

# Set — sem duplicatas

\`\`\`java
import java.util.HashSet;
import java.util.Set;

Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("programacao");
tags.add("java"); // ignorado — ja existe!

System.out.println(tags); // [java, programacao]
System.out.println(tags.size()); // 2
\`\`\`

# Map — chave e valor

\`\`\`java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> notas = new HashMap<>();
notas.put("Ana", 95);
notas.put("Bruno", 82);
notas.put("Carla", 91);

// Acessar
System.out.println(notas.get("Ana")); // 95

// Verificar
System.out.println(notas.containsKey("Bruno")); // true

// Percorrer
for (Map.Entry<String, Integer> entry : notas.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
\`\`\`

# Quando usar o que?

- List → quando a ORDEM importa e pode ter duplicatas (lista de compras, historico)
- Set → quando precisa de valores UNICOS (tags, categorias, IDs visitados)
- Map → quando precisa associar uma CHAVE a um VALOR (dicionario, cache, configuracoes)`,
    },
  },
  // JL22 — try-catch-finally
  {
    lessonId: LESSON_IDS.jl22,
    payload: {
      type: "text",
      markdown: `# try-catch-finally: tratando erros com elegancia

Erros acontecem. Arquivo nao encontrado, divisao por zero, input invalido... Em Java, usamos try-catch para TRATAR esses erros sem que o programa quebre.

# Estrutura basica

\`\`\`java
try {
    int resultado = 10 / 0; // ArithmeticException!
    System.out.println("Resultado: " + resultado);
} catch (ArithmeticException e) {
    System.out.println("Erro: divisao por zero!");
    System.out.println("Mensagem: " + e.getMessage());
} finally {
    System.out.println("Este bloco SEMPRE executa, com ou sem erro");
}

// Saida:
// Erro: divisao por zero!
// Mensagem: / by zero
// Este bloco SEMPRE executa, com ou sem erro
\`\`\`

# Multiplos catches

\`\`\`java
try {
    String texto = null;
    System.out.println(texto.length()); // NullPointerException!
} catch (NullPointerException e) {
    System.out.println("Variavel nula!");
} catch (Exception e) {
    // Captura qualquer outra excecao
    System.out.println("Erro inesperado: " + e.getMessage());
}
\`\`\`

> 💡 **Dica:** Regra de ouro: capture excecoes ESPECIFICAS primeiro (NullPointerException) e GENERICAS depois (Exception). Java verifica de cima para baixo!

> 📝 **Nota:** O bloco finally e otimo para fechar recursos (conexoes, arquivos). Em Java 7+, o try-with-resources faz isso automaticamente!`,
    },
  },
  // JL23 — Excecoes customizadas
  {
    lessonId: LESSON_IDS.jl23,
    payload: {
      type: "text",
      markdown: `# Excecoes customizadas e boas praticas

Voce pode criar suas proprias excecoes para representar erros especificos do seu dominio. Isso torna o codigo mais legivel e o tratamento de erros mais preciso.

# Criando uma excecao customizada

\`\`\`java
// Excecao checked (extends Exception)
public class SaldoInsuficienteException extends Exception {
    private double saldoAtual;
    private double valorSolicitado;

    public SaldoInsuficienteException(double saldoAtual, double valorSolicitado) {
        super("Saldo insuficiente. Saldo: R$" + saldoAtual +
              ", Solicitado: R$" + valorSolicitado);
        this.saldoAtual = saldoAtual;
        this.valorSolicitado = valorSolicitado;
    }

    public double getSaldoAtual() { return saldoAtual; }
    public double getValorSolicitado() { return valorSolicitado; }
}
\`\`\`

# Usando a excecao

\`\`\`java
public class ContaBancaria {
    private double saldo;

    public ContaBancaria(double saldoInicial) {
        this.saldo = saldoInicial;
    }

    public void sacar(double valor) throws SaldoInsuficienteException {
        if (valor > saldo) {
            throw new SaldoInsuficienteException(saldo, valor);
        }
        saldo -= valor;
        System.out.println("Saque de R$" + valor + " realizado!");
    }
}

// Uso:
try {
    ContaBancaria conta = new ContaBancaria(100.0);
    conta.sacar(150.0); // Lanca SaldoInsuficienteException
} catch (SaldoInsuficienteException e) {
    System.out.println(e.getMessage());
}
\`\`\`

# Boas praticas

- Nunca ignore excecoes com catch vazio: catch(Exception e) {}
- Capture excecoes especificas, nao so Exception generica
- Use excecoes para situacoes EXCEPCIONAIS, nao para fluxo normal
- Sempre inclua mensagens descritivas nas excecoes
- Prefira RuntimeException para erros de programacao, Exception para erros recuperaveis`,
    },
  },
  // JL24 — O que e Spring Boot
  {
    lessonId: LESSON_IDS.jl24,
    payload: {
      type: "text",
      markdown: `# O que e Spring Boot e por que usar?

Spring Boot e o framework mais popular para criar aplicacoes Java modernas, especialmente APIs REST. Ele simplifica DRASTICAMENTE a configuracao — voce foca no codigo, nao na infraestrutura.

> 📝 **Nota:** Sem Spring Boot, criar uma API em Java exigia dezenas de arquivos de configuracao XML. Com Spring Boot, voce cria uma API funcional em minutos!

# O que o Spring Boot faz por voce

- Servidor web embutido (Tomcat) — nao precisa instalar separadamente
- Configuracao automatica — detecta dependencias e configura tudo
- Injecao de dependencias — gerencia objetos automaticamente
- Producao-ready — metricas, health checks, logging ja inclusos

# Conceitos-chave

- @Controller / @RestController — classes que recebem requisicoes HTTP
- @Service — classes com logica de negocio
- @Repository — classes que acessam o banco de dados
- @GetMapping, @PostMapping, etc. — mapeiam URLs para metodos

> 💡 **Dica:** Spring Boot segue o padrao MVC (Model-View-Controller). Em uma API REST, o 'View' e substituido por respostas JSON.`,
    },
  },
  // JL25 — Criando seu primeiro projeto Spring Boot
  {
    lessonId: LESSON_IDS.jl25,
    payload: {
      type: "text",
      markdown: `# Criando seu primeiro projeto Spring Boot

Vamos usar o Spring Initializr para gerar o projeto e criar nossa primeira aplicacao.

# Passo 1: Gerar o projeto

- 1. Acesse https://start.spring.io
- 2. Escolha: Maven, Java 21, Spring Boot 3.x
- 3. Group: com.exemplo / Artifact: minha-api
- 4. Dependencias: Spring Web
- 5. Clique 'Generate' e descompacte o ZIP
- 6. Abra no IntelliJ ou VS Code

# Passo 2: Entendendo a estrutura

\`\`\`bash
minha-api/
├── src/main/java/com/exemplo/minhaapi/
│   └── MinhaApiApplication.java    ← Classe principal
├── src/main/resources/
│   └── application.properties       ← Configuracoes
├── src/test/java/                    ← Testes
└── pom.xml                           ← Dependencias (Maven)
\`\`\`

# Passo 3: Rodando

\`\`\`bash
# No terminal, dentro da pasta do projeto:
./mvnw spring-boot:run

# Ou no Windows:
mvnw.cmd spring-boot:run

# A aplicacao inicia em http://localhost:8080
\`\`\`

# Passo 4: Seu primeiro endpoint

\`\`\`java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Ola, Spring Boot!";
    }
}

// Acesse: http://localhost:8080/hello
// Resposta: Ola, Spring Boot!
\`\`\`

> 💡 **Dica:** O @RestController combina @Controller + @ResponseBody. Tudo que voce retornar e automaticamente convertido para JSON (ou texto simples para Strings).`,
    },
  },
  // JL26 — Construindo endpoints REST
  {
    lessonId: LESSON_IDS.jl26,
    payload: {
      type: "text",
      markdown: `# Construindo endpoints REST: GET, POST, PUT, DELETE

Agora vamos criar uma API completa de tarefas (to-do list). Voce vai implementar os 4 verbos HTTP mais usados.

# O modelo: Tarefa

\`\`\`java
public class Tarefa {
    private Long id;
    private String titulo;
    private String descricao;
    private boolean concluida;

    // Construtores
    public Tarefa() {}

    public Tarefa(Long id, String titulo, String descricao) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.concluida = false;
    }

    // Getters e Setters (omitidos por brevidade)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }
}
\`\`\`

# O controller completo

\`\`\`java
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private List<Tarefa> tarefas = new ArrayList<>();
    private Long proximoId = 1L;

    // GET /api/tarefas — listar todas
    @GetMapping
    public List<Tarefa> listar() {
        return tarefas;
    }

    // GET /api/tarefas/{id} — buscar por ID
    @GetMapping("/{id}")
    public Tarefa buscarPorId(@PathVariable Long id) {
        return tarefas.stream()
            .filter(t -> t.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Tarefa nao encontrada"));
    }

    // POST /api/tarefas — criar nova
    @PostMapping
    public Tarefa criar(@RequestBody Tarefa tarefa) {
        tarefa.setId(proximoId++);
        tarefas.add(tarefa);
        return tarefa;
    }

    // PUT /api/tarefas/{id} — atualizar
    @PutMapping("/{id}")
    public Tarefa atualizar(@PathVariable Long id, @RequestBody Tarefa atualizada) {
        Tarefa tarefa = buscarPorId(id);
        tarefa.setTitulo(atualizada.getTitulo());
        tarefa.setDescricao(atualizada.getDescricao());
        tarefa.setConcluida(atualizada.isConcluida());
        return tarefa;
    }

    // DELETE /api/tarefas/{id} — remover
    @DeleteMapping("/{id}")
    public String deletar(@PathVariable Long id) {
        tarefas.removeIf(t -> t.getId().equals(id));
        return "Tarefa " + id + " removida!";
    }
}
\`\`\`

# Testando com curl

\`\`\`bash
# Criar tarefa
curl -X POST http://localhost:8080/api/tarefas \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Estudar Java","descricao":"Completar o curso FocusQuest"}'

# Listar todas
curl http://localhost:8080/api/tarefas

# Buscar por ID
curl http://localhost:8080/api/tarefas/1

# Atualizar
curl -X PUT http://localhost:8080/api/tarefas/1 \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Estudar Java","descricao":"Curso concluido!","concluida":true}'

# Deletar
curl -X DELETE http://localhost:8080/api/tarefas/1
\`\`\`

> 💡 **Dica:** Parabens! Voce acabou de construir uma API REST completa! No mundo real, voce conectaria a um banco de dados com Spring Data JPA em vez de guardar em ArrayList.`,
    },
  },
  // JL27 — Quiz Final: Java e Spring Boot
  {
    lessonId: LESSON_IDS.jl27,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Qual anotacao marca uma classe como controller REST no Spring Boot?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "@Controller", isCorrect: false, feedback: "" },
            {
              id: "q1_b",
              text: "@RestController",
              isCorrect: true,
              feedback:
                "@RestController combina @Controller e @ResponseBody, indicando que todos os metodos retornam dados (geralmente JSON) diretamente.",
            },
            { id: "q1_c", text: "@Service", isCorrect: false, feedback: "" },
            { id: "q1_d", text: "@Repository", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "Qual verbo HTTP e usado para CRIAR um novo recurso?",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "GET", isCorrect: false, feedback: "" },
            { id: "q2_b", text: "PUT", isCorrect: false, feedback: "" },
            {
              id: "q2_c",
              text: "POST",
              isCorrect: true,
              feedback:
                "POST e usado para criar novos recursos. GET para ler, PUT para atualizar e DELETE para remover.",
            },
            { id: "q2_d", text: "DELETE", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q3",
          text: "O que @PathVariable faz?",
          type: "multiple_choice",
          options: [
            {
              id: "q3_a",
              text: "Define uma variavel de ambiente",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_b",
              text: "Captura um valor da URL (ex: /tarefas/{id})",
              isCorrect: true,
              feedback:
                "@PathVariable extrai valores da URL. Em /tarefas/42, o {id} seria capturado como 42.",
            },
            {
              id: "q3_c",
              text: "Injeta uma dependencia",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_d",
              text: "Define o tipo do retorno",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q4",
          text: "Qual e a vantagem principal do Spring Boot sobre o Spring tradicional?",
          type: "multiple_choice",
          options: [
            {
              id: "q4_a",
              text: "E mais rapido",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q4_b",
              text: "Usa menos memoria",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q4_c",
              text: "Configuracao automatica — menos boilerplate",
              isCorrect: true,
              feedback:
                "Spring Boot simplifica drasticamente a configuracao com auto-configuration, servidor embutido e opinoes sensatas padrao.",
            },
            {
              id: "q4_d",
              text: "Tem mais anotacoes",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q5",
          text: "Voce construiu uma API REST de tarefas! Qual seria o proximo passo para torna-la 'production-ready'?",
          type: "multiple_choice",
          options: [
            {
              id: "q5_a",
              text: "Adicionar mais endpoints GET",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q5_b",
              text: "Conectar a um banco de dados com Spring Data JPA",
              isCorrect: true,
              feedback:
                "Atualmente os dados ficam em memoria (ArrayList). Conectar a um banco de dados (PostgreSQL, MySQL) com Spring Data JPA persiste os dados permanentemente.",
            },
            {
              id: "q5_c",
              text: "Mudar de Java para Python",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q5_d",
              text: "Remover os imports",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // ===================== Java from Zero to Your First API (English) =====================
  // JL01en — What is Java and why learn it?
  {
    lessonId: LESSON_IDS.jl01en,
    payload: {
      type: "text",
      markdown: `# What is Java and why learn it?

Java is one of the most popular programming languages in the world. Created in 1995 by Sun Microsystems, it is used everywhere: Android apps, banking systems, e-commerce platforms and much more.

> 📝 **Note:** Java's motto is 'Write Once, Run Anywhere'. That's because Java code runs inside the JVM (Java Virtual Machine), which is available for Windows, Mac and Linux.

# Why is Java great for beginners?

- Clear and structured syntax — it forces you to organize your code
- Strongly typed — the compiler warns you of errors BEFORE running
- Huge community — there's always someone to help you
- Enormous job market — Java is in the top 3 most in-demand languages
- Solid foundation — learning Java makes it easier to switch to Kotlin, C#, and others

In this course, you'll go from absolute zero to building a working REST API. Let's go!`,
    },
  },
  // JL02en — Installing the JDK
  {
    lessonId: LESSON_IDS.jl02en,
    payload: {
      type: "text",
      markdown: `# Installing the JDK and setting up your environment

To program in Java, you need to install the JDK (Java Development Kit). It includes the compiler (javac) and the JVM to run your programs.

# Step by Step

- 1. Go to https://adoptium.net and download JDK 21 (LTS) for your operating system
- 2. Install following the standard wizard (Next, Next, Finish)
- 3. Open the terminal and type: java --version
- 4. If the version appears, congratulations! Java is installed

# Choosing an IDE

An IDE makes your life much easier. We recommend:

- IntelliJ IDEA Community (free) — the most popular for Java
- VS Code with the 'Extension Pack for Java' extension — lightweight and versatile
- Eclipse — a classic, but somewhat heavier

> 💡 **Tip:** For beginners, VS Code with Java extensions is the lightest option. If your computer can handle it, IntelliJ is unbeatable!

\`\`\`bash
# Check if Java is installed
java --version

# You should see something like:
# openjdk 21.0.2 2024-01-16
# OpenJDK Runtime Environment Temurin-21.0.2+13
\`\`\``,
    },
  },
  // JL03en — Hello World
  {
    lessonId: LESSON_IDS.jl03en,
    payload: {
      type: "text",
      markdown: `# Your first program: Hello World!

Every programmer starts this way. Let's create your first Java file and run it in the terminal.

# The Code

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world! I am programming in Java!");
    }
}
\`\`\`

# Understanding each part

- public class HelloWorld — defines a class called HelloWorld. In Java, EVERYTHING goes inside classes.
- public static void main(String[] args) — the main method is the program's entry point. Java always starts here.
- System.out.println(...) — prints text to the terminal. println adds a line break at the end.

# Compiling and running

\`\`\`bash
# Save the file as HelloWorld.java
# The file name MUST match the class name!

# Compile:
javac HelloWorld.java

# Run:
java HelloWorld

# Output: Hello, world! I am programming in Java!
\`\`\`

> 💡 **Tip:** In Java, the .java file name must be EXACTLY the same as the public class name. If the class is HelloWorld, the file must be HelloWorld.java.`,
    },
  },
  // JL04en — Variables
  {
    lessonId: LESSON_IDS.jl04en,
    payload: {
      type: "text",
      markdown: `# Variables: what they are and how to declare them

Variables are like labeled boxes where you store information. In Java, you need to specify the TYPE of information before using it.

# Declaring variables

\`\`\`java
// type name = value;
int idade = 25;
String nome = "Maria";
double altura = 1.65;
boolean estudante = true;

System.out.println("Nome: " + nome);
System.out.println("Idade: " + idade);
System.out.println("Altura: " + altura);
System.out.println("Estudante: " + estudante);
\`\`\`

# Rules for variable names

- Start with a lowercase letter (camelCase): myAge, fullName
- Cannot start with a number: 2name (wrong), name2 (correct)
- Cannot use reserved words: int, class, public, etc.
- Use descriptive names: balance is better than b

> 💡 **Tip:** Java is 'case-sensitive': age, Age and AGE are three different variables!`,
    },
  },
  // JL05en — Primitive types and operators
  {
    lessonId: LESSON_IDS.jl05en,
    payload: {
      type: "text",
      markdown: `# Primitive types and operators

Java has 8 primitive types. The most used in daily coding are: int, double, boolean and char.

# Primitive types

\`\`\`java
// Integers
byte pequeno = 127;          // -128 to 127
short medio = 32000;          // -32768 to 32767
int normal = 2000000000;      // ~-2bi to ~2bi
long grande = 9000000000L;    // very large (note the L)

// Decimals
float decimal = 3.14f;        // single precision (note the f)
double preciso = 3.14159265;  // double precision (default)

// Others
boolean ativo = true;         // true or false
char letra = 'A';             // a single character (single quotes!)
\`\`\`

# Operators

\`\`\`java
// Arithmetic
int soma = 10 + 3;      // 13
int sub = 10 - 3;       // 7
int mult = 10 * 3;      // 30
int div = 10 / 3;       // 3 (integer division!)
int resto = 10 % 3;     // 1 (modulo)

// Comparison (return boolean)
boolean igual = (10 == 10);    // true
boolean diferente = (10 != 5); // true
boolean maior = (10 > 5);     // true
boolean menorIgual = (10 <= 10); // true

// Logical
boolean e = true && false;   // false (AND)
boolean ou = true || false;  // true (OR)
boolean nao = !true;         // false (NOT)
\`\`\`

> 📝 **Note:** Careful: 10 / 3 = 3 in Java (integer division!). To get 3.33, use 10.0 / 3 or cast: (double) 10 / 3.`,
    },
  },
  // JL06en — Quiz Variables and Types
  {
    lessonId: LESSON_IDS.jl06en,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Which primitive type would you use to store the value 3.14?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "int", isCorrect: false, feedback: "" },
            { id: "q1_b", text: "String", isCorrect: false, feedback: "" },
            {
              id: "q1_c",
              text: "double",
              isCorrect: true,
              feedback:
                "double is the default type for decimal numbers in Java. float also works, but requires the 'f' suffix.",
            },
            { id: "q1_d", text: "boolean", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "What is the result of 10 / 3 in Java?",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "3.33", isCorrect: false, feedback: "" },
            {
              id: "q2_b",
              text: "3",
              isCorrect: true,
              feedback:
                "When both operands are int, Java performs integer division. 10 / 3 = 3 (the decimal is truncated).",
            },
            { id: "q2_c", text: "4", isCorrect: false, feedback: "" },
            {
              id: "q2_d",
              text: "Compilation error",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "Which variable name is valid in Java?",
          type: "multiple_choice",
          options: [
            { id: "q3_a", text: "2nome", isCorrect: false, feedback: "" },
            { id: "q3_b", text: "meu-nome", isCorrect: false, feedback: "" },
            {
              id: "q3_c",
              text: "meu_nome",
              isCorrect: true,
              feedback:
                "meu_nome is valid. Names cannot start with a number, contain hyphens, or use reserved words like 'class'.",
            },
            { id: "q3_d", text: "class", isCorrect: false, feedback: "" },
          ],
        },
      ],
    },
  },
  // JL07en — if, else if and else
  {
    lessonId: LESSON_IDS.jl07en,
    payload: {
      type: "text",
      markdown: `# if, else if and else in practice

Conditionals allow your program to make decisions. It's like in real life: IF it's raining, take an umbrella. ELSE, take sunglasses.

# Basic structure

\`\`\`java
int nota = 85;

if (nota >= 90) {
    System.out.println("Grade A — Excellent!");
} else if (nota >= 70) {
    System.out.println("Grade B — Good!");
} else if (nota >= 50) {
    System.out.println("Grade C — Average");
} else {
    System.out.println("Grade D — Needs improvement");
}
// Output: Grade B — Good!
\`\`\`

# Important tips

- The condition inside if MUST be boolean (true or false)
- Use == to compare numbers, .equals() to compare Strings
- Always use braces {} even with a single line — it prevents bugs
- Java evaluates top to bottom and STOPS at the first true condition

\`\`\`java
// Comparing Strings — CAREFUL!
String cor = "azul";

// WRONG (compares reference, not content):
if (cor == "azul") { ... }

// CORRECT (compares the content):
if (cor.equals("azul")) {
    System.out.println("Favorite color: azul!");
}
\`\`\`

> 💡 **Tip:** For ADHD: think of conditionals as 'decision trees'. Draw them on paper before coding — it helps a lot!`,
    },
  },
  // JL08en — switch-case and ternary
  {
    lessonId: LESSON_IDS.jl08en,
    payload: {
      type: "text",
      markdown: `# switch-case and ternary operator

When you have MANY conditions for the same variable, switch is cleaner than multiple if/else.

# Traditional switch

\`\`\`java
int diaSemana = 3;

switch (diaSemana) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Another day");
}
// Output: Wednesday
\`\`\`

# Modern switch (Java 14+)

\`\`\`java
String dia = switch (diaSemana) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    case 4 -> "Thursday";
    case 5 -> "Friday";
    default -> "Weekend";
};
System.out.println(dia); // Wednesday
\`\`\`

# Ternary operator

\`\`\`java
// condition ? valueIfTrue : valueIfFalse
int idade = 20;
String status = (idade >= 18) ? "Adult" : "Minor";
System.out.println(status); // Adult
\`\`\`

> 📝 **Note:** The ternary operator is great for simple assignments. For complex logic, prefer if/else — readability matters!`,
    },
  },
  // JL09en — For loop
  {
    lessonId: LESSON_IDS.jl09en,
    payload: {
      type: "text",
      markdown: `# For loop: repeating with control

The for loop is used when you know HOW MANY times you want to repeat something. It's the most used loop in Java.

# For structure

\`\`\`java
// for (init; condition; increment)
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
// Output:
// Count: 1
// Count: 2
// Count: 3
// Count: 4
// Count: 5
\`\`\`

# for-each (enhanced for)

\`\`\`java
String[] frutas = {"Maca", "Banana", "Laranja"};

for (String fruta : frutas) {
    System.out.println("Fruit: " + fruta);
}
// Output:
// Fruit: Maca
// Fruit: Banana
// Fruit: Laranja
\`\`\`

> 💡 **Tip:** Use the classic for when you need the index (i). Use for-each when you only need the value — it's cleaner and less error-prone!

# break and continue

\`\`\`java
for (int i = 1; i <= 10; i++) {
    if (i == 5) break;    // stops the loop when i = 5
    if (i % 2 == 0) continue; // skips even numbers
    System.out.println(i);    // prints: 1, 3
}
\`\`\``,
    },
  },
  // JL10en — while and do-while
  {
    lessonId: LESSON_IDS.jl10en,
    payload: {
      type: "text",
      markdown: `# while and do-while: repeating with a condition

Use while when you DON'T know how many times it will repeat — you only know the stopping condition.

# while

\`\`\`java
int tentativas = 0;
int senha = 1234;
int tentativa = 0;

while (tentativa != senha && tentativas < 3) {
    // Simulates an attempt
    tentativa = 1111; // in practice, this would come from user input
    tentativas++;
    System.out.println("Attempt " + tentativas);
}

if (tentativa == senha) {
    System.out.println("Correct password!");
} else {
    System.out.println("Blocked after 3 attempts");
}
\`\`\`

# do-while

The difference: do-while executes the block AT LEAST ONCE before checking the condition.

\`\`\`java
int numero;
do {
    numero = (int) (Math.random() * 10); // 0 to 9
    System.out.println("Drawn number: " + numero);
} while (numero != 7);

System.out.println("Found 7!");
\`\`\`

> 📝 **Note:** Watch out for infinite loops! Always make sure the condition will eventually become false. If it freezes, Ctrl+C in the terminal to stop.`,
    },
  },
  // JL11en — Quiz Loops
  {
    lessonId: LESSON_IDS.jl11en,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Which loop would you use when you know exactly how many times you want to repeat?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "while", isCorrect: false, feedback: "" },
            { id: "q1_b", text: "do-while", isCorrect: false, feedback: "" },
            {
              id: "q1_c",
              text: "for",
              isCorrect: true,
              feedback:
                "The for loop is ideal when the number of iterations is known: for (int i = 0; i < n; i++).",
            },
            { id: "q1_d", text: "if-else", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "What is the difference between while and do-while?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "There is no difference",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "do-while executes at least once before checking the condition",
              isCorrect: true,
              feedback:
                "do-while checks the condition AFTER executing the block, guaranteeing at least one execution.",
            },
            {
              id: "q2_c",
              text: "while is faster",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "do-while doesn't accept break",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "What does the 'continue' command do inside a loop?",
          type: "multiple_choice",
          options: [
            {
              id: "q3_a",
              text: "Stops the loop completely",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_b",
              text: "Skips to the next iteration",
              isCorrect: true,
              feedback:
                "continue skips the rest of the current block and goes straight to the next loop iteration.",
            },
            {
              id: "q3_c",
              text: "Repeats the current iteration",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_d",
              text: "Exits the program",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // JL12en — Arrays
  {
    lessonId: LESSON_IDS.jl12en,
    payload: {
      type: "text",
      markdown: `# Arrays: storing multiple values

An array is a structure that stores multiple values of the SAME type in sequence. Think of it as a row of numbered boxes.

# Creating arrays

\`\`\`java
// Method 1: declare and initialize
int[] notas = {85, 92, 78, 95, 88};

// Method 2: declare with fixed size
String[] nomes = new String[3];
nomes[0] = "Ana";
nomes[1] = "Bruno";
nomes[2] = "Carla";

// Accessing values
System.out.println(notas[0]);    // 85 (first element)
System.out.println(notas[4]);    // 88 (last element)
System.out.println(notas.length); // 5 (array size)
\`\`\`

# Iterating through arrays

\`\`\`java
int[] numeros = {10, 20, 30, 40, 50};

// With classic for
for (int i = 0; i < numeros.length; i++) {
    System.out.println("Index " + i + ": " + numeros[i]);
}

// With for-each (cleaner)
for (int n : numeros) {
    System.out.println("Value: " + n);
}
\`\`\`

> 📝 **Note:** Arrays in Java start at index 0! If the array has 5 elements, indices go from 0 to 4. Accessing index 5 causes an ArrayIndexOutOfBoundsException.

> 💡 **Tip:** Arrays have a FIXED size. If you need something that grows dynamically, use ArrayList (we'll see it soon!).`,
    },
  },
  // JL13en — Strings
  {
    lessonId: LESSON_IDS.jl13en,
    payload: {
      type: "text",
      markdown: `# Strings: text manipulation in Java

String is the most used type in Java for text. Although it's not a primitive type (it's a class), Java treats Strings in a special way.

# Useful String methods

\`\`\`java
String nome = "Maria Silva";

System.out.println(nome.length());          // 11
System.out.println(nome.toUpperCase());     // MARIA SILVA
System.out.println(nome.toLowerCase());     // maria silva
System.out.println(nome.trim());            // removes extra spaces
System.out.println(nome.contains("Silva")); // true
System.out.println(nome.startsWith("Mar")); // true
System.out.println(nome.substring(0, 5));   // Maria
System.out.println(nome.replace("Silva", "Santos")); // Maria Santos
System.out.println(nome.charAt(0));         // M
\`\`\`

# Concatenation and formatting

\`\`\`java
// Concatenation with +
String saudacao = "Ola, " + nome + "!";

// String.format (cleaner for multiple variables)
int idade = 25;
String msg = String.format("Nome: %s, Idade: %d", nome, idade);

// Text blocks (Java 15+) — great for long texts
String json = """
        {
            "nome": "Maria",
            "idade": 25
        }
        """;
\`\`\`

> 💡 **Tip:** NEVER compare Strings with ==. Always use .equals(). The == operator compares if they are the same object in memory, not if the content is equal!`,
    },
  },
  // JL14en — Classes and Objects
  {
    lessonId: LESSON_IDS.jl14en,
    payload: {
      type: "text",
      markdown: `# Classes and Objects: the pillars of Java

Java is an object-oriented language (OOP). This means everything revolves around CLASSES (blueprints) and OBJECTS (instances of those blueprints).

> 📝 **Note:** Think of it this way: a CLASS is the blueprint for a house. An OBJECT is the house built from that blueprint. You can build multiple houses (objects) from the same blueprint (class).

# Creating a class

\`\`\`java
public class Aluno {
    // Attributes (characteristics)
    String nome;
    int idade;
    double nota;

    // Method (behavior)
    void apresentar() {
        System.out.println("Hi, I'm " + nome + " and I'm " + idade + " years old.");
    }

    void estudar(String materia) {
        System.out.println(nome + " is studying " + materia);
    }
}
\`\`\`

# Creating and using objects

\`\`\`java
public class Main {
    public static void main(String[] args) {
        // Creating an object
        Aluno aluno1 = new Aluno();
        aluno1.nome = "Pedro";
        aluno1.idade = 22;
        aluno1.nota = 8.5;

        Aluno aluno2 = new Aluno();
        aluno2.nome = "Ana";
        aluno2.idade = 20;
        aluno2.nota = 9.2;

        aluno1.apresentar(); // Hi, I'm Pedro and I'm 22 years old.
        aluno2.estudar("Java"); // Ana is studying Java
    }
}
\`\`\`

> 💡 **Tip:** Each object has its own copy of the attributes. Changing aluno1's name does NOT affect aluno2. They are independent instances!`,
    },
  },
  // JL15en — Methods, constructors and encapsulation
  {
    lessonId: LESSON_IDS.jl15en,
    payload: {
      type: "text",
      markdown: `# Methods, constructors and encapsulation

Now let's enhance our classes with constructors (to initialize objects cleanly) and encapsulation (to protect data).

# Constructors

\`\`\`java
public class Aluno {
    private String nome;
    private int idade;
    private double nota;

    // Constructor — same name as the class, no return type
    public Aluno(String nome, int idade, double nota) {
        this.nome = nome;   // this distinguishes attribute from parameter
        this.idade = idade;
        this.nota = nota;
    }

    // No-argument constructor (overloading)
    public Aluno() {
        this.nome = "No name";
        this.idade = 0;
        this.nota = 0.0;
    }
}
\`\`\`

# Encapsulation: getters and setters

\`\`\`java
public class Aluno {
    private String nome;
    private double nota;

    public Aluno(String nome, double nota) {
        this.nome = nome;
        setNota(nota); // uses the setter to validate
    }

    // Getter — allows READING the value
    public String getNome() {
        return nome;
    }

    // Setter — allows CHANGING with validation
    public void setNota(double nota) {
        if (nota < 0 || nota > 10) {
            throw new IllegalArgumentException("Grade must be between 0 and 10");
        }
        this.nota = nota;
    }

    public double getNota() {
        return nota;
    }
}
\`\`\`

> 📝 **Note:** Encapsulation = private attributes + access via getters/setters. This protects your data and allows validation. It's one of the pillars of OOP!`,
    },
  },
  // JL16en — Quiz OOP Basics
  {
    lessonId: LESSON_IDS.jl16en,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "What is the difference between a class and an object?",
          type: "multiple_choice",
          options: [
            {
              id: "q1_a",
              text: "There is no difference",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_b",
              text: "A class is the blueprint/template, an object is an instance created from it",
              isCorrect: true,
              feedback:
                "The class defines the structure (attributes and methods). The object is a concrete instance created with 'new'.",
            },
            {
              id: "q1_c",
              text: "An object is the blueprint, a class is the instance",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_d",
              text: "Classes only exist in Java",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q2",
          text: "What does the 'this' keyword do in Java?",
          type: "multiple_choice",
          options: [
            {
              id: "q2_a",
              text: "Creates a new object",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_b",
              text: "Refers to the current object of the class",
              isCorrect: true,
              feedback:
                "this refers to the current instance of the object. It's used to disambiguate when the parameter and attribute have the same name.",
            },
            {
              id: "q2_c",
              text: "Imports a library",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q2_d",
              text: "Defines a generic type",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q3",
          text: "Why do we use private attributes with getters and setters?",
          type: "multiple_choice",
          options: [
            {
              id: "q3_a",
              text: "To make the code longer",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_b",
              text: "To encapsulate and protect data, allowing validation",
              isCorrect: true,
              feedback:
                "Encapsulation protects data and allows adding validation logic in setters before changing values.",
            },
            {
              id: "q3_c",
              text: "Because Java requires it",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_d",
              text: "To make the program run faster",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // JL17en — Inheritance
  {
    lessonId: LESSON_IDS.jl17en,
    payload: {
      type: "text",
      markdown: `# Inheritance: reusing code with extends

Inheritance allows you to create new classes based on existing classes, reusing code. The child class INHERITS attributes and methods from the parent class.

# Practical example

\`\`\`java
// Parent class (superclass)
public class Animal {
    protected String nome;
    protected int idade;

    public Animal(String nome, int idade) {
        this.nome = nome;
        this.idade = idade;
    }

    public void comer() {
        System.out.println(nome + " is eating");
    }

    public void dormir() {
        System.out.println(nome + " is sleeping");
    }
}

// Child class (subclass)
public class Cachorro extends Animal {
    private String raca;

    public Cachorro(String nome, int idade, String raca) {
        super(nome, idade); // calls the parent constructor
        this.raca = raca;
    }

    public void latir() {
        System.out.println(nome + " says: Woof woof!");
    }
}

// Usage:
Cachorro rex = new Cachorro("Rex", 3, "Labrador");
rex.comer();  // inherited from Animal
rex.dormir(); // inherited from Animal
rex.latir();  // specific to Cachorro
\`\`\`

# Method overriding (@Override)

\`\`\`java
public class Gato extends Animal {
    public Gato(String nome, int idade) {
        super(nome, idade);
    }

    @Override
    public void comer() {
        System.out.println(nome + " is eating cat food");
    }
}

// Usage:
Gato mimi = new Gato("Mimi", 2);
mimi.comer(); // Mimi is eating cat food (overridden version!)
\`\`\`

> 💡 **Tip:** Always use @Override when overriding a method. The compiler checks if you're actually overriding something — it prevents typo bugs!`,
    },
  },
  // JL18en — Polymorphism and interfaces
  {
    lessonId: LESSON_IDS.jl18en,
    payload: {
      type: "text",
      markdown: `# Polymorphism and interfaces

Polymorphism means 'many forms'. In Java, you can treat child objects as if they were of the parent type. This makes code flexible and extensible.

# Polymorphism in action

\`\`\`java
// We can use the parent type to reference child objects
Animal animal1 = new Cachorro("Rex", 3, "Labrador");
Animal animal2 = new Gato("Mimi", 2);

// The method called depends on the ACTUAL type of the object
animal1.comer(); // Rex is eating (Animal's method, since Cachorro didn't override it)
animal2.comer(); // Mimi is eating cat food (overridden method)
\`\`\`

# Interfaces

An interface is a contract. It defines WHICH methods a class must have, but doesn't say HOW to implement them.

\`\`\`java
// Interface
public interface Pagavel {
    double calcularPagamento();
    String getDescricao();
}

// Implementation
public class Freelancer implements Pagavel {
    private String nome;
    private double valorHora;
    private int horas;

    public Freelancer(String nome, double valorHora, int horas) {
        this.nome = nome;
        this.valorHora = valorHora;
        this.horas = horas;
    }

    @Override
    public double calcularPagamento() {
        return valorHora * horas;
    }

    @Override
    public String getDescricao() {
        return "Freelancer: " + nome;
    }
}
\`\`\`

> 📝 **Note:** A class can only inherit from ONE class (extends), but can implement MULTIPLE interfaces (implements). Interfaces are like 'abilities' that a class can have.`,
    },
  },
  // JL19en — Quiz Inheritance and Polymorphism
  {
    lessonId: LESSON_IDS.jl19en,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "What does the 'super' keyword do in a child class constructor?",
          type: "multiple_choice",
          options: [
            {
              id: "q1_a",
              text: "Creates a new object of the parent class",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_b",
              text: "Calls the parent class (superclass) constructor",
              isCorrect: true,
              feedback:
                "super() calls the parent class constructor, allowing initialization of inherited attributes.",
            },
            {
              id: "q1_c",
              text: "Defines the class as superior",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q1_d",
              text: "Imports methods from another class",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q2",
          text: "How many interfaces can a class implement?",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "Only 1", isCorrect: false, feedback: "" },
            { id: "q2_b", text: "Only 2", isCorrect: false, feedback: "" },
            {
              id: "q2_c",
              text: "As many as desired",
              isCorrect: true,
              feedback:
                "Java allows implementing multiple interfaces (unlike inheritance, which is limited to one parent class).",
            },
            {
              id: "q2_d",
              text: "None, interfaces don't exist in Java",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
  // JL20en — List, ArrayList and LinkedList
  {
    lessonId: LESSON_IDS.jl20en,
    payload: {
      type: "text",
      markdown: `# List, ArrayList and LinkedList

Unlike arrays, Collections in Java can grow and shrink dynamically. The most used is ArrayList — think of it as an array that grows by itself!

# ArrayList in practice

\`\`\`java
import java.util.ArrayList;
import java.util.List;

List<String> nomes = new ArrayList<>();

// Add
nomes.add("Ana");
nomes.add("Bruno");
nomes.add("Carla");

// Access
System.out.println(nomes.get(0));  // Ana
System.out.println(nomes.size());  // 3

// Remove
nomes.remove("Bruno");
System.out.println(nomes); // [Ana, Carla]

// Check
System.out.println(nomes.contains("Ana")); // true

// Iterate
for (String nome : nomes) {
    System.out.println("Name: " + nome);
}
\`\`\`

# ArrayList vs LinkedList

- ArrayList: fast access by index (get), insertion/removal in the middle is slow
- LinkedList: fast insertion/removal at any position, access by index is slow
- In practice: use ArrayList in 95% of cases. Only use LinkedList if you do MANY insertions/removals in the middle of the list.

> 💡 **Tip:** Declare as List<> (interface) and initialize as ArrayList<> (implementation). This way you can switch to LinkedList later without changing the rest of the code!`,
    },
  },
  // JL21en — Set, Map and when to use each one
  {
    lessonId: LESSON_IDS.jl21en,
    payload: {
      type: "text",
      markdown: `# Set, Map and when to use each one

Besides List, Java has Set (a collection without duplicates) and Map (key-value pairs). Knowing when to use each one is essential!

# Set — no duplicates

\`\`\`java
import java.util.HashSet;
import java.util.Set;

Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("programming");
tags.add("java"); // ignored — already exists!

System.out.println(tags); // [java, programming]
System.out.println(tags.size()); // 2
\`\`\`

# Map — key and value

\`\`\`java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> notas = new HashMap<>();
notas.put("Ana", 95);
notas.put("Bruno", 82);
notas.put("Carla", 91);

// Access
System.out.println(notas.get("Ana")); // 95

// Check
System.out.println(notas.containsKey("Bruno")); // true

// Iterate
for (Map.Entry<String, Integer> entry : notas.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
\`\`\`

# When to use what?

- List → when ORDER matters and duplicates are allowed (shopping list, history)
- Set → when you need UNIQUE values (tags, categories, visited IDs)
- Map → when you need to associate a KEY with a VALUE (dictionary, cache, settings)`,
    },
  },
  // JL22en — try-catch-finally
  {
    lessonId: LESSON_IDS.jl22en,
    payload: {
      type: "text",
      markdown: `# try-catch-finally: handling errors gracefully

Errors happen. File not found, division by zero, invalid input... In Java, we use try-catch to HANDLE these errors without crashing the program.

# Basic structure

\`\`\`java
try {
    int resultado = 10 / 0; // ArithmeticException!
    System.out.println("Result: " + resultado);
} catch (ArithmeticException e) {
    System.out.println("Error: division by zero!");
    System.out.println("Message: " + e.getMessage());
} finally {
    System.out.println("This block ALWAYS executes, with or without an error");
}

// Output:
// Error: division by zero!
// Message: / by zero
// This block ALWAYS executes, with or without an error
\`\`\`

# Multiple catches

\`\`\`java
try {
    String texto = null;
    System.out.println(texto.length()); // NullPointerException!
} catch (NullPointerException e) {
    System.out.println("Null variable!");
} catch (Exception e) {
    // Catches any other exception
    System.out.println("Unexpected error: " + e.getMessage());
}
\`\`\`

> 💡 **Tip:** Golden rule: catch SPECIFIC exceptions first (NullPointerException) and GENERIC ones after (Exception). Java checks from top to bottom!

> 📝 **Note:** The finally block is great for closing resources (connections, files). In Java 7+, try-with-resources does this automatically!`,
    },
  },
  // JL23en — Custom exceptions
  {
    lessonId: LESSON_IDS.jl23en,
    payload: {
      type: "text",
      markdown: `# Custom exceptions and best practices

You can create your own exceptions to represent errors specific to your domain. This makes the code more readable and error handling more precise.

# Creating a custom exception

\`\`\`java
// Checked exception (extends Exception)
public class SaldoInsuficienteException extends Exception {
    private double saldoAtual;
    private double valorSolicitado;

    public SaldoInsuficienteException(double saldoAtual, double valorSolicitado) {
        super("Insufficient balance. Balance: $" + saldoAtual +
              ", Requested: $" + valorSolicitado);
        this.saldoAtual = saldoAtual;
        this.valorSolicitado = valorSolicitado;
    }

    public double getSaldoAtual() { return saldoAtual; }
    public double getValorSolicitado() { return valorSolicitado; }
}
\`\`\`

# Using the exception

\`\`\`java
public class ContaBancaria {
    private double saldo;

    public ContaBancaria(double saldoInicial) {
        this.saldo = saldoInicial;
    }

    public void sacar(double valor) throws SaldoInsuficienteException {
        if (valor > saldo) {
            throw new SaldoInsuficienteException(saldo, valor);
        }
        saldo -= valor;
        System.out.println("Withdrawal of $" + valor + " completed!");
    }
}

// Usage:
try {
    ContaBancaria conta = new ContaBancaria(100.0);
    conta.sacar(150.0); // Throws SaldoInsuficienteException
} catch (SaldoInsuficienteException e) {
    System.out.println(e.getMessage());
}
\`\`\`

# Best practices

- Never ignore exceptions with an empty catch: catch(Exception e) {}
- Catch specific exceptions, not just the generic Exception
- Use exceptions for EXCEPTIONAL situations, not for normal flow
- Always include descriptive messages in exceptions
- Prefer RuntimeException for programming errors, Exception for recoverable errors`,
    },
  },
  // JL24en — What is Spring Boot
  {
    lessonId: LESSON_IDS.jl24en,
    payload: {
      type: "text",
      markdown: `# What is Spring Boot and why use it?

Spring Boot is the most popular framework for building modern Java applications, especially REST APIs. It DRASTICALLY simplifies configuration — you focus on code, not infrastructure.

> 📝 **Note:** Without Spring Boot, creating an API in Java required dozens of XML configuration files. With Spring Boot, you can create a working API in minutes!

# What Spring Boot does for you

- Embedded web server (Tomcat) — no need to install separately
- Auto-configuration — detects dependencies and configures everything
- Dependency injection — manages objects automatically
- Production-ready — metrics, health checks, logging already included

# Key concepts

- @Controller / @RestController — classes that receive HTTP requests
- @Service — classes with business logic
- @Repository — classes that access the database
- @GetMapping, @PostMapping, etc. — map URLs to methods

> 💡 **Tip:** Spring Boot follows the MVC pattern (Model-View-Controller). In a REST API, the 'View' is replaced by JSON responses.`,
    },
  },
  // JL25en — Creating your first Spring Boot project
  {
    lessonId: LESSON_IDS.jl25en,
    payload: {
      type: "text",
      markdown: `# Creating your first Spring Boot project

Let's use Spring Initializr to generate the project and create our first application.

# Step 1: Generate the project

- 1. Go to https://start.spring.io
- 2. Choose: Maven, Java 21, Spring Boot 3.x
- 3. Group: com.example / Artifact: my-api
- 4. Dependencies: Spring Web
- 5. Click 'Generate' and unzip the ZIP file
- 6. Open in IntelliJ or VS Code

# Step 2: Understanding the structure

\`\`\`bash
my-api/
├── src/main/java/com/example/myapi/
│   └── MyApiApplication.java          ← Main class
├── src/main/resources/
│   └── application.properties          ← Configuration
├── src/test/java/                      ← Tests
└── pom.xml                             ← Dependencies (Maven)
\`\`\`

# Step 3: Running

\`\`\`bash
# In the terminal, inside the project folder:
./mvnw spring-boot:run

# Or on Windows:
mvnw.cmd spring-boot:run

# The application starts at http://localhost:8080
\`\`\`

# Step 4: Your first endpoint

\`\`\`java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}

// Access: http://localhost:8080/hello
// Response: Hello, Spring Boot!
\`\`\`

> 💡 **Tip:** @RestController combines @Controller + @ResponseBody. Everything you return is automatically converted to JSON (or plain text for Strings).`,
    },
  },
  // JL26en — Building REST endpoints
  {
    lessonId: LESSON_IDS.jl26en,
    payload: {
      type: "text",
      markdown: `# Building REST endpoints: GET, POST, PUT, DELETE

Now let's create a complete task API (to-do list). You'll implement the 4 most used HTTP verbs.

# The model: Task

\`\`\`java
public class Tarefa {
    private Long id;
    private String titulo;
    private String descricao;
    private boolean concluida;

    // Constructors
    public Tarefa() {}

    public Tarefa(Long id, String titulo, String descricao) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.concluida = false;
    }

    // Getters and Setters (omitted for brevity)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }
}
\`\`\`

# The complete controller

\`\`\`java
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private List<Tarefa> tarefas = new ArrayList<>();
    private Long proximoId = 1L;

    // GET /api/tarefas — list all
    @GetMapping
    public List<Tarefa> listar() {
        return tarefas;
    }

    // GET /api/tarefas/{id} — find by ID
    @GetMapping("/{id}")
    public Tarefa buscarPorId(@PathVariable Long id) {
        return tarefas.stream()
            .filter(t -> t.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    // POST /api/tarefas — create new
    @PostMapping
    public Tarefa criar(@RequestBody Tarefa tarefa) {
        tarefa.setId(proximoId++);
        tarefas.add(tarefa);
        return tarefa;
    }

    // PUT /api/tarefas/{id} — update
    @PutMapping("/{id}")
    public Tarefa atualizar(@PathVariable Long id, @RequestBody Tarefa atualizada) {
        Tarefa tarefa = buscarPorId(id);
        tarefa.setTitulo(atualizada.getTitulo());
        tarefa.setDescricao(atualizada.getDescricao());
        tarefa.setConcluida(atualizada.isConcluida());
        return tarefa;
    }

    // DELETE /api/tarefas/{id} — remove
    @DeleteMapping("/{id}")
    public String deletar(@PathVariable Long id) {
        tarefas.removeIf(t -> t.getId().equals(id));
        return "Task " + id + " removed!";
    }
}
\`\`\`

# Testing with curl

\`\`\`bash
# Create task
curl -X POST http://localhost:8080/api/tarefas \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Study Java","descricao":"Complete the FocusQuest course"}'

# List all
curl http://localhost:8080/api/tarefas

# Find by ID
curl http://localhost:8080/api/tarefas/1

# Update
curl -X PUT http://localhost:8080/api/tarefas/1 \\
  -H "Content-Type: application/json" \\
  -d '{"titulo":"Study Java","descricao":"Course completed!","concluida":true}'

# Delete
curl -X DELETE http://localhost:8080/api/tarefas/1
\`\`\`

> 💡 **Tip:** Congratulations! You just built a complete REST API! In the real world, you'd connect it to a database with Spring Data JPA instead of storing in an ArrayList.`,
    },
  },
  // JL27en — Final Quiz: Java and Spring Boot
  {
    lessonId: LESSON_IDS.jl27en,
    payload: {
      type: "quiz",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          text: "Which annotation marks a class as a REST controller in Spring Boot?",
          type: "multiple_choice",
          options: [
            { id: "q1_a", text: "@Controller", isCorrect: false, feedback: "" },
            {
              id: "q1_b",
              text: "@RestController",
              isCorrect: true,
              feedback:
                "@RestController combines @Controller and @ResponseBody, indicating that all methods return data (usually JSON) directly.",
            },
            { id: "q1_c", text: "@Service", isCorrect: false, feedback: "" },
            { id: "q1_d", text: "@Repository", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q2",
          text: "Which HTTP verb is used to CREATE a new resource?",
          type: "multiple_choice",
          options: [
            { id: "q2_a", text: "GET", isCorrect: false, feedback: "" },
            { id: "q2_b", text: "PUT", isCorrect: false, feedback: "" },
            {
              id: "q2_c",
              text: "POST",
              isCorrect: true,
              feedback:
                "POST is used to create new resources. GET to read, PUT to update and DELETE to remove.",
            },
            { id: "q2_d", text: "DELETE", isCorrect: false, feedback: "" },
          ],
        },
        {
          id: "q3",
          text: "What does @PathVariable do?",
          type: "multiple_choice",
          options: [
            {
              id: "q3_a",
              text: "Defines an environment variable",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_b",
              text: "Captures a value from the URL (e.g., /tarefas/{id})",
              isCorrect: true,
              feedback:
                "@PathVariable extracts values from the URL. In /tarefas/42, {id} would be captured as 42.",
            },
            {
              id: "q3_c",
              text: "Injects a dependency",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q3_d",
              text: "Defines the return type",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q4",
          text: "What is the main advantage of Spring Boot over traditional Spring?",
          type: "multiple_choice",
          options: [
            {
              id: "q4_a",
              text: "It's faster",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q4_b",
              text: "It uses less memory",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q4_c",
              text: "Auto-configuration — less boilerplate",
              isCorrect: true,
              feedback:
                "Spring Boot drastically simplifies configuration with auto-configuration, embedded server and sensible defaults.",
            },
            {
              id: "q4_d",
              text: "It has more annotations",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
        {
          id: "q5",
          text: "You built a REST API for tasks! What would be the next step to make it 'production-ready'?",
          type: "multiple_choice",
          options: [
            {
              id: "q5_a",
              text: "Add more GET endpoints",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q5_b",
              text: "Connect to a database with Spring Data JPA",
              isCorrect: true,
              feedback:
                "Currently the data is stored in memory (ArrayList). Connecting to a database (PostgreSQL, MySQL) with Spring Data JPA persists data permanently.",
            },
            {
              id: "q5_c",
              text: "Switch from Java to Python",
              isCorrect: false,
              feedback: "",
            },
            {
              id: "q5_d",
              text: "Remove the imports",
              isCorrect: false,
              feedback: "",
            },
          ],
        },
      ],
    },
  },
];

// ===========================================================================
// Run seed
// ===========================================================================

async function seed() {
  console.log("🌱 Seeding database...");

  await db
    .insert(badges)
    .values(BADGES)
    .onConflictDoNothing({ target: badges.slug });

  console.log(`✅ Seeded ${BADGES.length} badges`);

  await db
    .insert(quests)
    .values(QUESTS)
    .onConflictDoNothing({ target: quests.slug });

  console.log(`✅ Seeded ${QUESTS.length} quests`);

  await db
    .insert(avatarItems)
    .values(AVATAR_ITEMS)
    .onConflictDoNothing({ target: avatarItems.slug });

  console.log(`✅ Seeded ${AVATAR_ITEMS.length} avatar items`);

  // ---------------------------------------------------------------------------
  // Admin user (admin@admin.com / admin)
  // ---------------------------------------------------------------------------
  const adminEmail = "admin@admin.com";
  const [existingAdmin] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("admin", 12);
    const [admin] = await db
      .insert(users)
      .values({
        email: adminEmail,
        name: "admin",
        passwordHash,
        role: "super_admin",
        onboardingCompleted: true,
      })
      .returning();

    if (admin) {
      await Promise.all([
        db.insert(userPreferences).values({ userId: admin.id }),
        db.insert(userCoins).values({ userId: admin.id }),
        db.insert(streaks).values({ userId: admin.id }),
        db
          .insert(avatars)
          .values({ userId: admin.id, baseCharacter: "default" }),
        db.insert(userLevels).values({ userId: admin.id }),
      ]);
      console.log("✅ Created admin user (admin@admin.com / admin)");
    }
  } else {
    console.log("ℹ️  Admin user already exists, skipping");
  }

  // ---------------------------------------------------------------------------
  // Courses, Modules, Lessons & Content
  // ---------------------------------------------------------------------------

  // Get the admin user ID for creatorId
  const [adminUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@admin.com"))
    .limit(1);

  if (adminUser) {
    const creatorId = adminUser.id;

    // Insert courses
    for (const course of SEED_COURSES) {
      await db
        .insert(courses)
        .values({ ...course, creatorId })
        .onConflictDoNothing();
    }
    console.log(`✅ Seeded ${SEED_COURSES.length} courses`);

    // Insert modules
    for (const mod of SEED_MODULES) {
      await db.insert(modules).values(mod).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${SEED_MODULES.length} modules`);

    // Insert lessons
    for (const lesson of SEED_LESSONS) {
      await db.insert(lessons).values(lesson).onConflictDoNothing();
    }
    console.log(`✅ Seeded ${SEED_LESSONS.length} lessons`);

    // Insert lesson content (upsert to update payload format if changed)
    for (const content of SEED_LESSON_CONTENT) {
      await db
        .insert(lessonContent)
        .values(content)
        .onConflictDoUpdate({
          target: lessonContent.lessonId,
          set: { payload: content.payload, updatedAt: new Date() },
        });
    }
    console.log(`✅ Seeded ${SEED_LESSON_CONTENT.length} lesson contents`);
  } else {
    console.log("⚠️  No admin user found, skipping course seed");
  }

  console.log("🎉 Seed complete!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
