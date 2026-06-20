import { cards, type Flashcard } from "./cards";

export type TheoryAnswer = {
  question: string;
  answer: string;
  formulas: string[];
};

export type PracticeGraph = {
  kind: "histogram" | "line" | "step" | "piecewise";
  title: string;
  subtitle?: string;
  labels: string[];
  values: number[];
  xValues?: number[];
  axisTicks?: Array<{ value: number; label: string }>;
  xLabel?: string;
  yLabel?: string;
  yMin?: number;
  yMax?: number;
  yTicks?: number[];
  tickFormat?: "number" | "fraction";
  area?: boolean;
  caption?: string;
};

export type PracticeAnswer = {
  task: string;
  steps: string[];
  shortCalculation: string;
  answer: string;
  graphs?: PracticeGraph[];
};

export type Ticket = {
  number: number;
  duplicateOf?: number;
  theory: [TheoryAnswer, TheoryAnswer];
  practice: PracticeAnswer;
};

type TheoryRef = {
  id: string;
  question?: string;
};

const byId = new Map(cards.map((card) => [card.id, card]));

function theory(ref: TheoryRef): TheoryAnswer {
  const card = byId.get(ref.id);
  if (!card) throw new Error(`Не найдена теория: ${ref.id}`);
  return {
    question: ref.question ?? card.question,
    answer: card.oralAnswer,
    formulas: card.formulas,
  };
}

const practices: Record<string, PracticeAnswer> = {
  histogramModeMedian: {
    task: "Интервалы [1;2), [2;3), [3;4), [4;5), [5;6); частоты 2, 5, 11, 8, 4. Построить гистограмму и определить моду и медиану.",
    steps: [
      "Объём выборки: N = 2 + 5 + 11 + 8 + 4 = 30. Накопленные частоты: 2, 7, 18, 26, 30.",
      "Модальный интервал [3;4), так как его частота 11 максимальна. Lm = 3, h = 1, fm = 11, fпред = 5, fслед = 8.",
      "Mo = Lm + h·(fm − fпред) / [(fm − fпред) + (fm − fслед)] = 3 + 6/9 ≈ 3,67.",
      "N/2 = 15. Медианный интервал [3;4), так как накопленная частота в нём впервые превышает 15. До него накоплено 7 значений.",
      "Me = Le + h·(N/2 − Sпред) / fe = 3 + (15 − 7)/11 ≈ 3,73.",
    ],
    shortCalculation: "N=30; Mo=3+(11−5)/[(11−5)+(11−8)]≈3,67; Me=3+(15−7)/11≈3,73.",
    answer: "Гистограмма строится по заданным интервалам. Mo ≈ 3,67; Me ≈ 3,73.",
  },
  expertMeanVariance: {
    task: "По экспертным оценкам построить дискретный вариационный ряд, найти выборочное среднее и дисперсию.",
    steps: [
      "Вариационный ряд: xᵢ = 0, 1, 2, 3, 4; частоты nᵢ = 5, 4, 6, 5, 4. Объём n = 24.",
      "Сумма Σ(xᵢnᵢ) = 47, а сумма Σ(xᵢ²nᵢ) = 137.",
      "Выборочное среднее: x̄ = 47/24 ≈ 1,9583.",
      "Средний квадрат: x̄² = 137/24 ≈ 5,7083. Выборочная дисперсия: Dв = 137/24 − (47/24)² ≈ 1,8733.",
      "Исправленная дисперсия: s² = Dв·n/(n−1) = 1,8733·24/23 ≈ 1,9547.",
    ],
    shortCalculation: "x̄=47/24≈1,9583; Dв=137/24−(47/24)²≈1,8733; s²=Dв·24/23≈1,9547.",
    answer: "x̄ ≈ 1,9583; Dв ≈ 1,8733; исправленная дисперсия s² ≈ 1,9547.",
  },
  saltsFull: {
    task: "Построить гистограмму, найти выборочное среднее и дисперсию содержания солей в воде.",
    steps: [
      "n = 24, xmin = 420, xmax = 710. По формуле Стерджесса k ≈ 6; берём ширину интервала h ≈ 50 мг/л.",
      "Интервалы и частоты: [420;470) — 2, [470;520) — 4, [520;570) — 5, [570;620) — 6, [620;670) — 5, [670;720] — 2.",
      "По исходным данным Σxᵢ = 13 650, поэтому x̄ = 13 650/24 = 568,75 мг/л.",
      "Σxᵢ² = 7 889 300. Dв = 7 889 300/24 − 568,75² ≈ 5 244,27 (мг/л)².",
      "Исправленная дисперсия: s² = Dв·24/23 ≈ 5 472,28 (мг/л)².",
    ],
    shortCalculation: "x̄=13650/24=568,75; Dв=7889300/24−568,75²≈5244,27; s²=Dв·24/23≈5472,28.",
    answer: "x̄ = 568,75 мг/л; Dв ≈ 5 244,27 (мг/л)²; s² ≈ 5 472,28 (мг/л)².",
  },
  expertModeMedian: {
    task: "Построить дискретный вариационный ряд экспертных оценок, найти моду и медиану, построить кумуляту.",
    steps: [
      "Ряд: xᵢ = 0, 1, 2, 3, 4; частоты nᵢ = 5, 7, 5, 3, 2. Объём n = 22.",
      "Накопленные частоты: 5, 12, 17, 20, 22. Кумуляту строят по точкам (xᵢ; Nᵢ/n): (0; 0,2273), (1; 0,5455), (2; 0,7727), (3; 0,9091), (4; 1).",
      "Наибольшая частота равна 7, поэтому мода Mo = 1.",
      "Так как n = 22, медиана определяется 11-м и 12-м элементами. Оба относятся к значению 1.",
      "Me = (x₁₁ + x₁₂)/2 = (1 + 1)/2 = 1.",
    ],
    shortCalculation: "Mo=1; Me=(x₁₁+x₁₂)/2=(1+1)/2=1; Nᵢ/n: 5/22, 12/22, 17/22, 20/22, 1.",
    answer: "Mo = 1; Me = 1. Кумулята строится по накопленным относительным частотам.",
  },
  gradesPolygon: {
    task: "Экзаменационные оценки представить в виде дискретного вариационного ряда, построить полигон частот и кумуляту.",
    steps: [
      "Ряд: оценки 2, 3, 4, 5; частоты 3, 9, 7, 7. Объём n = 26.",
      "Относительные частоты: 3/26 = 0,1154; 9/26 = 0,3462; 7/26 = 0,2692; 7/26 = 0,2692.",
      "Накопленные частоты: 3, 12, 19, 26.",
      "Полигон частот соединяет точки (2;3), (3;9), (4;7), (5;7). Кумулята строится по накопленным частотам или их относительным значениям.",
    ],
    shortCalculation: "wᵢ=3/26, 9/26, 7/26, 7/26; Nᵢ=3,12,19,26; полигон: (2;3),(3;9),(4;7),(5;7).",
    answer: "Вариационный ряд построен. Наиболее частая оценка — 3, её частота равна 9.",
  },
  advanceHistogram: {
    task: "Данные об авансе представить в виде интервального вариационного ряда и построить гистограмму.",
    steps: [
      "n = 39, xmin = 3 100 грн, xmax = 11 900 грн. Размах R = 8 800 грн.",
      "По формуле Стерджесса k ≈ 6,29. Принимаем 6 интервалов шириной h = 1 500 грн.",
      "Интервалы и частоты: [3000;4500) — 6, [4500;6000) — 8, [6000;7500) — 8, [7500;9000) — 10, [9000;10500) — 4, [10500;12000] — 3.",
      "Все интервалы одной ширины, поэтому высоты столбцов гистограммы пропорциональны частотам.",
    ],
    shortCalculation: "R=11900−3100=8800; k≈6,29≈6; h≈8800/6≈1466,7≈1500; max nᵢ=10.",
    answer: "Наибольшая частота равна 10 и соответствует интервалу [7500;9000).",
  },
  saltsHistogram: {
    task: "Построить гистограмму содержания солей в воде.",
    steps: [
      "n = 24, xmin = 420, xmax = 710. По формуле Стерджесса выбираем 6 интервалов с шириной примерно 50 мг/л.",
      "Частоты интервалов: [420;470) — 2, [470;520) — 4, [520;570) — 5, [570;620) — 6, [620;670) — 5, [670;720] — 2.",
      "Строим гистограмму: по оси X откладываем интервалы, по оси Y — частоты. Так как ширины равны, высоты столбцов можно брать равными частотам.",
    ],
    shortCalculation: "k≈1+3,322·lg24≈6; h≈(710−420)/6≈50; max nᵢ=6 для [570;620).",
    answer: "Максимальная частота равна 6 и приходится на интервал [570;620).",
  },
  densityFromCdf: {
    task: "F(x)=0 при x<1; F(x)=(x−1)/9 при 1≤x≤10; F(x)=1 при x>10. Найти плотность, построить графики и определить P(0≤X≤20).",
    steps: [
      "Плотность равна производной функции распределения на участках дифференцируемости.",
      "На промежутке (1;10): f(x) = 1/9. Вне этого промежутка F(x) постоянна, поэтому f(x) = 0.",
      "Проверка нормировки: ∫₁¹⁰(1/9)dx = (10−1)/9 = 1.",
      "Интервал [0;20] полностью включает возможные значения X из [1;10]. Поэтому P(0≤X≤20) = F(20) − F(0) = 1 − 0 = 1.",
    ],
    shortCalculation: "f(x)=F′(x)=1/9 на (1;10); ∫₁¹⁰(1/9)dx=1; P=F(20)−F(0)=1−0=1.",
    answer: "f(x)=1/9 при 1<x<10 и 0 вне этого интервала; P(0≤X≤20)=1.",
  },
  diceIndependent: {
    task: "Бросают два игральных кубика. Найти вероятность того, что на первом выпадет 6, а на втором — чётное число.",
    steps: [
      "A — на первом кубике выпала 6; B — на втором выпало чётное число. Броски независимы.",
      "P(A)=1/6. Для события B благоприятны 2, 4 и 6, поэтому P(B)=3/6=1/2.",
      "Для независимых событий P(A∩B)=P(A)·P(B)=1/6·1/2=1/12.",
    ],
    shortCalculation: "P(A)=1/6; P(B)=3/6=1/2; P(A∩B)=1/6·1/2=1/12≈0,0833.",
    answer: "P = 1/12 ≈ 0,0833.",
  },
  intervalWide: {
    task: "Интервалы [0;2), [2;4), [4;6), [6;8); частоты 4, 3, 7, 2. Построить гистограмму и определить моду и медиану.",
    steps: [
      "Объём выборки N = 4+3+7+2 = 16. Накопленные частоты: 4, 7, 14, 16.",
      "Модальный интервал [4;6): Lm=4, h=2, fm=7, соседние частоты 3 и 2.",
      "Mo = 4 + 2·(7−3)/[(7−3)+(7−2)] = 4 + 8/9 ≈ 4,89.",
      "N/2 = 8. Медианный интервал [4;6), до него накоплено 7 значений.",
      "Me = 4 + 2·(8−7)/7 = 4 + 2/7 ≈ 4,29.",
    ],
    shortCalculation: "N=16; Mo=4+2·4/(4+5)=4+8/9≈4,89; Me=4+2·(8−7)/7≈4,29.",
    answer: "Mo ≈ 4,89; Me ≈ 4,29.",
  },
};


const graphsByPractice: Partial<Record<keyof typeof practices, PracticeGraph[]>> = {
  histogramModeMedian: [
    {
      kind: "histogram",
      title: "Гистограмма интервального ряда",
      subtitle: "Высота каждого столбца равна частоте интервала",
      labels: ["[1;2)", "[2;3)", "[3;4)", "[4;5)", "[5;6)"],
      values: [2, 5, 11, 8, 4],
      xLabel: "Интервалы значений",
      yLabel: "Частота",
      yMax: 12,
      yTicks: [0, 3, 6, 9, 12],
      caption: "Модальным является интервал [3;4), так как его частота максимальна.",
    },
  ],
  saltsFull: [
    {
      kind: "histogram",
      title: "Гистограмма содержания солей",
      subtitle: "Интервалы шириной 50 мг/л",
      labels: ["420–470", "470–520", "520–570", "570–620", "620–670", "670–720"],
      values: [2, 4, 5, 6, 5, 2],
      xLabel: "Содержание солей, мг/л",
      yLabel: "Частота",
      yMax: 6,
      yTicks: [0, 1, 2, 3, 4, 5, 6],
      caption: "Наибольшая частота наблюдается в интервале [570;620).",
    },
  ],
  expertModeMedian: [
    {
      kind: "step",
      title: "Кумулята экспертных оценок",
      subtitle: "Накопленные относительные частоты",
      labels: ["0", "1", "2", "3", "4"],
      values: [0.2273, 0.5455, 0.7727, 0.9091, 1],
      xLabel: "Оценка",
      yLabel: "Накопленная частота",
      yMax: 1,
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      tickFormat: "fraction",
      caption: "Кумулята показывает долю наблюдений, не превышающих указанную оценку.",
    },
  ],
  gradesPolygon: [
    {
      kind: "line",
      title: "Полигон частот оценок",
      subtitle: "Точки вариационного ряда соединены отрезками",
      labels: ["2", "3", "4", "5"],
      values: [3, 9, 7, 7],
      xLabel: "Оценка",
      yLabel: "Частота",
      yMax: 10,
      yTicks: [0, 2, 4, 6, 8, 10],
      caption: "Самая частая оценка — 3, она встречается 9 раз.",
    },
    {
      kind: "step",
      title: "Кумулята оценок",
      subtitle: "Накопленные относительные частоты",
      labels: ["2", "3", "4", "5"],
      values: [3 / 26, 12 / 26, 19 / 26, 1],
      xLabel: "Оценка",
      yLabel: "Накопленная частота",
      yMax: 1,
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      tickFormat: "fraction",
      caption: "Кумулята строится по накопленным частотам 3, 12, 19 и 26.",
    },
  ],
  advanceHistogram: [
    {
      kind: "histogram",
      title: "Гистограмма распределения аванса",
      subtitle: "Все интервалы имеют одинаковую ширину 1 500 грн",
      labels: ["3–4,5", "4,5–6", "6–7,5", "7,5–9", "9–10,5", "10,5–12"],
      values: [6, 8, 8, 10, 4, 3],
      xLabel: "Аванс, тыс. грн",
      yLabel: "Частота",
      yMax: 10,
      yTicks: [0, 2, 4, 6, 8, 10],
      caption: "Наибольшее число наблюдений находится в интервале [7500;9000).",
    },
  ],
  saltsHistogram: [
    {
      kind: "histogram",
      title: "Гистограмма содержания солей",
      subtitle: "Распределение по шести равным интервалам",
      labels: ["420–470", "470–520", "520–570", "570–620", "620–670", "670–720"],
      values: [2, 4, 5, 6, 5, 2],
      xLabel: "Содержание солей, мг/л",
      yLabel: "Частота",
      yMax: 6,
      yTicks: [0, 1, 2, 3, 4, 5, 6],
      caption: "Максимальная частота равна 6 и относится к интервалу [570;620).",
    },
  ],
  densityFromCdf: [
    {
      kind: "piecewise",
      title: "Плотность распределения f(x)",
      subtitle: "Плотность постоянна только на интервале (1;10)",
      labels: [],
      xValues: [-1, 1, 1, 10, 10, 12],
      axisTicks: [
        { value: -1, label: "−1" },
        { value: 1, label: "1" },
        { value: 10, label: "10" },
        { value: 12, label: "12" },
      ],
      values: [0, 0, 1 / 9, 1 / 9, 0, 0],
      xLabel: "x",
      yLabel: "f(x)",
      yMax: 0.14,
      yTicks: [0, 0.035, 0.07, 0.105, 0.14],
      tickFormat: "fraction",
      area: true,
      caption: "Площадь прямоугольника под графиком равна 1: (10 − 1) · 1/9 = 1.",
    },
    {
      kind: "piecewise",
      title: "Функция распределения F(x)",
      subtitle: "Линейно возрастает от 0 до 1 на [1;10]",
      labels: [],
      xValues: [-1, 1, 10, 12],
      axisTicks: [
        { value: -1, label: "−1" },
        { value: 1, label: "1" },
        { value: 10, label: "10" },
        { value: 12, label: "12" },
      ],
      values: [0, 0, 1, 1],
      xLabel: "x",
      yLabel: "F(x)",
      yMax: 1,
      yTicks: [0, 0.25, 0.5, 0.75, 1],
      tickFormat: "fraction",
      caption: "Интервал [0;20] полностью содержит область возможных значений X, поэтому вероятность равна 1.",
    },
  ],
  intervalWide: [
    {
      kind: "histogram",
      title: "Гистограмма интервального ряда",
      subtitle: "Ширина каждого интервала равна 2",
      labels: ["[0;2)", "[2;4)", "[4;6)", "[6;8)"],
      values: [4, 3, 7, 2],
      xLabel: "Интервалы значений",
      yLabel: "Частота",
      yMax: 8,
      yTicks: [0, 2, 4, 6, 8],
      caption: "Модальный и медианный интервалы совпадают: [4;6).",
    },
  ],
};

const baseTickets: Array<{ theory: [TheoryRef, TheoryRef]; practice: keyof typeof practices }> = [
  { theory: [{ id: "arrangements" }, { id: "continuous-and-interval-series" }], practice: "histogramModeMedian" },
  { theory: [{ id: "combinations" }, { id: "point-estimation" }], practice: "expertMeanVariance" },
  { theory: [{ id: "permutations" }, { id: "mode-median" }], practice: "saltsFull" },
  { theory: [{ id: "addition-exclusive" }, { id: "combinations" }], practice: "expertModeMedian" },
  { theory: [{ id: "addition-joint" }, { id: "exponential-distribution" }], practice: "gradesPolygon" },
  { theory: [{ id: "classical-probability" }, { id: "local-moivre-laplace" }], practice: "advanceHistogram" },
  { theory: [{ id: "geometric-probability" }, { id: "cdf-pdf" }], practice: "saltsHistogram" },
  { theory: [{ id: "integral-moivre-laplace" }, { id: "statistical-series" }], practice: "expertModeMedian" },
  {
    theory: [
      { id: "addition-joint", question: "Теорема сложения вероятностей совместных случайных событий." },
      { id: "mode-median" },
    ],
    practice: "densityFromCdf",
  },
  { theory: [{ id: "conditional-and-multiplication" }, { id: "bernoulli-theorem" }], practice: "histogramModeMedian" },
  { theory: [{ id: "bayes" }, { id: "cdf-pdf" }], practice: "saltsHistogram" },
  { theory: [{ id: "bernoulli-theorem" }, { id: "statistical-series" }], practice: "densityFromCdf" },
  { theory: [{ id: "poisson" }, { id: "statistical-series" }], practice: "saltsHistogram" },
  { theory: [{ id: "geometric-probability" }, { id: "continuous-characteristics" }], practice: "diceIndependent" },
  { theory: [{ id: "discrete-characteristics" }, { id: "continuous-and-interval-series" }], practice: "gradesPolygon" },
  { theory: [{ id: "continuous-characteristics" }, { id: "poisson" }], practice: "intervalWide" },
];

const originalTickets: Ticket[] = baseTickets.map((item, index) => ({
  number: index + 1,
  theory: [theory(item.theory[0]), theory(item.theory[1])],
  practice: { ...practices[item.practice], graphs: graphsByPractice[item.practice] },
}));

const duplicateTickets: Ticket[] = Array.from({ length: 14 }, (_, index) => {
  const originalNumber = index + 1;
  const original = originalTickets[index];
  return {
    number: index + 17,
    duplicateOf: originalNumber,
    theory: original.theory,
    practice: original.practice,
  };
});

export const tickets: Ticket[] = [...originalTickets, ...duplicateTickets];

export function findTicket(number: number): Ticket {
  return tickets.find((ticket) => ticket.number === number) ?? tickets[0];
}
