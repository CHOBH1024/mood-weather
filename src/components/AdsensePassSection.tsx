import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface Column {
  title: string;
  category: string;
  content: string;
}

const columnsData: Column[] = [
  {
    title: '날씨와 감정의 과학적 상관관계 — 햇빛과 세로토닌의 마법',
    category: '기후 심리학',
    content: '우리가 날씨에 따라 기분의 고저를 경험하는 것은 단순한 기분 탓이 아니라 호르몬과 신경전달물질의 변화에 기반한 과학적 현상입니다. 햇빛은 우리 뇌에서 행복 호르몬이라 불리는 세로토닌(Serotonin)의 합성을 촉진하는 핵심 동력원입니다. 화창한 날 야외 활동을 할 때 마음이 편안해지고 활력이 도는 것은 바로 이 때문입니다. 반대로 장마철이나 흐린 날에는 일조량이 감소하면서 수면 유도 호르몬인 멜라토닌(Melatonin)의 분비가 늘어나 낮에도 나른함과 피로감을 쉽게 느끼게 됩니다. 이러한 기후적 요인은 개인의 생산성과 감정선에 거대한 나비효과를 미치므로, 날씨 상태를 메타인지적으로 인지하고 일조량이 적은 날에는 실내 조도를 한껏 높이거나 가벼운 스트레칭 세션을 고수하여 세로토닌 분비를 활성화하는 지혜가 필요합니다.'
  },
  {
    title: '기상 후 1시간의 기적 — 뇌 과학 기반 모닝 루틴 설계법',
    category: '모닝 루틴',
    content: '아침에 눈을 뜨고 맞이하는 첫 1시간은 하루 전체의 인지 기능과 감정적 온도를 결정하는 핵심 골든 아워입니다. 뇌 과학 관점에서 모닝 루틴의 첫 단추는 "빛 쬐기"와 "수분 섭취"입니다. 기상 직후 창문을 열고 자연광을 쬐어주면 코르티솔 분비가 정상화되면서 신체 스위치가 켜지고 멜라토닌 분비가 억제됩니다. 또한, 밤새 손실된 수분을 한 잔의 미온수로 보충해주면 혈액 순환이 촉진되어 두뇌 회로가 깨어납니다. 이 시점에는 즉각 도파민을 자극하는 스마트폰 확인을 원천 차단하고, 10분간의 가벼운 정렬 스트레칭이나 메타인지적 명상을 배치해 뇌가 평온하고 주도적인 상태에서 하루를 출발하도록 세팅해야 합니다. 아침의 미세한 루틴 성공 감각은 도파민 분비를 촉진해 그날의 몰입 효율성을 극대화해 줍니다.'
  },
  {
    title: '신체, 지성, 감성의 바이오리듬이 의사결정에 미치는 영향',
    category: '바이오리듬',
    content: '인간의 신체 능력과 정신적 컨디션은 주기적인 에너지 흐름, 즉 바이오리듬(Biorhythm)의 지배를 받습니다. 바이오리듬은 크게 육체적 활동성과 면역력을 조율하는 신체 리듬(23일 주기), 기분 선과 스트레스 내성을 조율하는 감성 리듬(28일 주기), 논리적 판단력과 기억 능력을 조율하는 지성 리듬(33일 주기)으로 구분됩니다. 이 세 가지 텐션의 지수가 조화롭게 높은 상승기에 있을 때는 중요한 비즈니스 의사결정이나 고난이도의 학습을 처리하는 데 최적의 타이밍입니다. 반대로 각 리듬이 하강 기조에 머무는 시기에는 사소한 일에도 주의력이 쉽게 산만해지고 감정 제어가 어려워질 수 있으므로, 자신의 텐션 데이터를 미리 모니터링하여 휴식 비율을 높이고 리스크 있는 액션은 피보팅하거나 뒤로 미루는 완급 조절이 대단히 중요합니다.'
  },
  {
    title: '불면과 스트레스를 치유하는 취침 전 디톡스 루틴 가이드',
    category: '수면 위생',
    content: '건강한 기상은 결국 전날 밤의 완벽한 수면 위생에서 시작됩니다. 만성 스트레스와 불면에 시달리는 직장인이라면 취침 1시간 전부터 철저한 "디지털 및 인지 디톡스" 루틴을 가동해야 합니다. 스마트폰과 TV 화면에서 방출되는 블루라이트는 뇌가 여전히 낮이라고 착각하게 만들어 멜라토닌 합성을 심각하게 저해합니다. 따라서 취침 60분 전에는 모든 디지털 화면을 멀리하고 조명을 간접 조명 수준으로 은은하게 낮추어야 합니다. 대신 가벼운 스트레칭이나 따뜻한 허브차 복용, 그리고 그날 겪은 생각의 파편들을 메타인지적으로 털어내 기록하는 감사 일기를 심어주면 뇌의 인지적 각성이 완화됩니다. 이 수면 준비 과정을 거치면 뇌가 빠르게 서파 수면(깊은 잠) 단계로 진입하여 이튿날 최상의 맑은 정신으로 깨어날 수 있습니다.'
  },
  {
    title: '계절성 정서 장애(SAD) 예방을 위한 영양 및 활동 밸런스',
    category: '멘탈 웰니스',
    content: '일조량이 급격히 감소하는 가을과 겨울철에 특별히 의욕이 저하되고 우울감을 경험하는 증상을 "계절성 정서 장애(Seasonal Affective Disorder, SAD)"라고 부릅니다. 이는 생체 시계를 조율하는 빛 노출량의 저하와 영양 불균형이 주원인입니다. 이를 예방하기 위해서는 햇빛 아래서 하루 20분 이상 산책하는 야외 루틴을 설정하여 뼈 건강과 면역력을 지탱하는 비타민 D의 분비를 자극해야 합니다. 또한 세로토닌 합성의 원료가 되는 트립토판이 풍부한 식품(예: 바나나, 견과류, 계란 등)을 식단에 골고루 반영해 주는 영양 밸런스가 필요합니다. 계절의 변화에 신체가 거부감 없이 적응하도록 주도적으로 멘탈과 활동 지표를 케어하는 스마트한 라이프스타일은, 어떤 환경적 변동성 아래서도 흔들림 없이 나의 고유 페이스를 유지하게 돕는 최고의 웰니스 가드레일이 됩니다.'
  },
  {
    title: '감정 날씨 일기 — 나의 무드 패턴을 데이터로 기록하고 해석하는 법',
    category: '감정 기록',
    content: '우리는 매일 수십 가지의 미세한 감정 상태를 경험하지만, 대부분은 그 흐름을 무의식 속에 흘려보내며 반복되는 감정 패턴을 인식하지 못합니다. 감정 날씨 일기(Mood Journal)는 자신의 감정 상태를 날씨에 비유하여 매일 간단히 기록함으로써 자신의 무드 사이클과 트리거(Trigger) 요인을 데이터로 가시화하는 강력한 자기 인식 도구입니다. 기록의 방법은 단순합니다. 매일 일과를 마치는 시점에 그날의 감정적 날씨를 "맑음(활기, 기쁨)", "흐림(우울, 무기력)", "폭풍(분노, 불안)", "안개(혼란, 무감각)" 등 몇 가지 직관적인 코드로 분류하고, 어떤 사건이나 사람, 장소가 그 감정을 촉발했는지 한두 줄로 메모합니다. 이를 2~4주간 꾸준히 수행하면 자신이 어떤 날씨(계절 변화, 특정 요일)와 어떤 유형의 사람(에너지 드레이너 vs 충전자)과의 관계에서 특정 감정이 집중적으로 발생하는지 뚜렷한 패턴이 드러납니다. 이 데이터를 바탕으로 에너지가 소진되는 반복 요인을 사전에 차단하고, 나를 충전시키는 활동과 환경을 의도적으로 늘리는 삶의 리설계가 가능해집니다. 감정의 날씨를 주도적으로 관찰하고 기록하는 습관은 작은 변화처럼 보이지만, 장기적으로 나 자신에 대한 가장 깊고 신뢰할 수 있는 지식 체계를 구축하는 가장 조용하고 강력한 자기 성장의 여정입니다.'
  }
];

export const AdsensePassSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-6 py-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <BookOpen className="w-6 h-6 text-sky-400" />
        <h2 className="text-xl font-bold text-white tracking-wide">
          Knowledge Hub &amp; 전문가 칼럼
        </h2>
      </div>
      
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">
        본 시스템은 실시간 기상 상태 분석 및 개인의 심신 바이오리듬 진단을 제공하며, 
        아래 칼럼 섹션은 멘탈 웰니스 및 최적의 일상 라이프스타일 설계를 위해 정기적으로 업데이트되는 지식 아카이브입니다.
      </p>

      <div className="space-y-4">
        {columnsData.map((column, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="rounded-xl border border-white/5 bg-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors duration-200 hover:bg-white/5"
              >
                <div className="flex-1">
                  <span className="inline-block px-2 py-0.5 mb-1.5 text-xs font-semibold rounded bg-sky-500/20 text-sky-300">
                    {column.category}
                  </span>
                  <h3 className="text-base font-semibold text-white leading-snug">
                    {column.title}
                  </h3>
                </div>
                <div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-sky-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-[800px] border-t border-white/5 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="p-5 text-sm text-gray-300 leading-relaxed font-light whitespace-pre-line">
                  {column.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
