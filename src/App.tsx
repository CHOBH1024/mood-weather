import { useState, useEffect, useMemo } from 'react';
import { 
  CloudRain, 
  Sun, 
  Cloud, 
  Snowflake, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Sparkles, 
  RotateCcw,
  Zap,
  Smile,
  Target,
  ArrowRight,
  BookOpen,
  Coffee,
  Activity,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import confetti from 'canvas-confetti';
import { AdsensePassSection } from './components/AdsensePassSection';

// API interfaces
interface LocationData {
  city: string;
  latitude: number;
  longitude: number;
  country_name: string;
}

interface WeatherData {
  temp: number;
  humidity: number;
  rain: number;
  windSpeed: number;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
}

interface HistoryItem {
  id: string;
  date: string;
  condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
  temp: number;
  energy: number;
  mood: number;
  focus: number;
  headline: string;
}

export default function App() {
  // App States
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // User Input States (1 to 5)
  const [energy, setEnergy] = useState<number>(3);
  const [mood, setMood] = useState<number>(3);
  const [focus, setFocus] = useState<number>(3);
  
  const [isPrescribed, setIsPrescribed] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 1. Fetch IP-based Location & Weather + Resize & History Load
  useEffect(() => {
    async function loadBioWeather() {
      try {
        setLoading(true);
        // Step A: Get location from IP
        const locRes = await fetch('https://ipapi.co/json/');
        if (!locRes.ok) throw new Error('Location fetch failed');
        const locData: LocationData = await locRes.json();
        setLocation(locData);

        // Step B: Get weather forecast from Open-Meteo
        const lat = locData.latitude || 37.566; // Fallback to Seoul
        const lon = locData.longitude || 126.978;
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,showers,snowfall,wind_speed_10m`;
        
        const weatherRes = await fetch(weatherUrl);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const rawWeather = await weatherRes.json();
        
        const current = rawWeather.current;
        const temp = Math.round(current.temperature_2m);
        const humidity = current.relative_humidity_2m;
        const rain = current.rain + current.showers;
        const snow = current.snowfall;
        const windSpeed = Math.round(current.wind_speed_10m);

        let condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy' = 'sunny';
        if (rain > 0.1) condition = 'rainy';
        else if (snow > 0.1) condition = 'snowy';
        else if (humidity > 75) condition = 'cloudy';

        setWeather({ temp, humidity, rain, windSpeed, condition });
        setIsFallback(false);
      } catch (err) {
        console.error('API 로드 실패 - 폴백 모크 적용', err);
        setIsFallback(true);
        // Fallback Mock Data
        setLocation({
          city: 'Seoul',
          latitude: 37.566,
          longitude: 126.978,
          country_name: 'South Korea'
        });
        setWeather({
          temp: 22,
          humidity: 50,
          rain: 0,
          windSpeed: 8,
          condition: 'sunny'
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadBioWeather();

    // Resize listener for Responsive Charts
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Load History from localStorage
    try {
      const saved = localStorage.getItem('harness_weather_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Raindrop generator for rainy background
  const raindrops = useMemo(() => {
    if (weather?.condition !== 'rainy') return [];
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1 + Math.random() * 1.5}s`
    }));
  }, [weather?.condition]);

  // Snowflake generator for snowy background
  const snowflakes = useMemo(() => {
    if (weather?.condition !== 'snowy') return [];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
      size: `${2 + Math.random() * 4}px`
    }));
  }, [weather?.condition]);

  // 2. Prescription Logic (오늘의 갓생 루틴 및 행동 요령 매핑)
  const routinePrescription = useMemo(() => {
    if (!weather) return null;
    
    const isCold = weather.temp < 10;
    const isHot = weather.temp > 28;
    const isWet = weather.condition === 'rainy';

    // 9차원 상태 지수 계산 (에너지, 감정, 집중도 + 날씨 조건 결합)
    const computeIndex = (base: number, modifier: number) => {
      return Math.min(100, Math.max(10, base * 20 + modifier));
    };

    // 지표 매핑
    const physical = computeIndex(energy, isCold ? -10 : isHot ? -15 : 10);
    const emotional = computeIndex(mood, isWet ? -10 : 15);
    const cognitive = computeIndex(focus, isHot ? -10 : 10);
    const creativity = computeIndex((mood + focus)/2, isWet ? 20 : 0); // 비오면 창의성 상승
    const social = computeIndex((energy + mood)/2, isWet ? -20 : isHot ? -15 : 15);
    const calmness = computeIndex(5 - energy + 2, isWet ? 20 : 0);
    const drive = computeIndex(energy, focus > 3 ? 15 : -10);
    const flexibility = computeIndex(mood, isCold ? -10 : 10);
    const intuition = computeIndex((5 - focus + mood)/2, 20);

    const radarData = [
      { subject: '신체 활력', A: physical, fullMark: 100 },
      { subject: '감성 수용', A: emotional, fullMark: 100 },
      { subject: '인지 집중', A: cognitive, fullMark: 100 },
      { subject: '창의 영감', A: creativity, fullMark: 100 },
      { subject: '사회성', A: social, fullMark: 100 },
      { subject: '평온/안정', A: calmness, fullMark: 100 },
      { subject: '돌파/추진', A: drive, fullMark: 100 },
      { subject: '행동 유연', A: flexibility, fullMark: 100 },
      { subject: '직관 판단', A: intuition, fullMark: 100 },
    ];

    // 날씨 & 감성 매핑 루틴 처방
    let headline = '';
    let routines: string[] = [];
    let routineReason = '';
    let musicGenre = '';

    if (isWet) {
      if (energy <= 2) {
        headline = '차분한 비 내리는 날의 힐링 보존형 처방 🕯️';
        routineReason = '외부 습도가 높고 체내 에너지가 부족합니다. 억지로 무리한 활동을 하기보다 에너지를 충전하고 정신을 맑게 다듬는 고요한 충전이 적절합니다.';
        routines = [
          '실내에서 가벼운 요가 및 5분 명상 🧘',
          '따뜻한 국물이나 루이보스 티 마시기 🍵',
          '주변 서랍장이나 데스크 1곳만 가볍게 비우고 정리하기 🧹'
        ];
        musicGenre = 'Acoustic Indie & Jazz 🎷';
      } else {
        headline = '비 내리는 창가 아래, 창조적 몰입 처방 🎨';
        routineReason = '비가 오는 날은 기압이 낮아 감수성이 풍부해지고 뇌의 창의 파동이 활성화됩니다. 고도의 집중이 필요한 기획이나 사색 활동을 추천합니다.';
        routines = [
          '미뤄뒀던 기획서나 아이디어 3개 일기장에 러프하게 적어보기 ✍️',
          '방의 조명을 아늑하게 낮추고 책 20페이지 집중해서 읽기 📚',
          '창밖 빗소리와 백색소음을 배경 삼아 집중해서 할 일 1개 끝내기 🎯'
        ];
        musicGenre = 'Lo-Fi Beats & Ambient Piano 🎹';
      }
    } else {
      // 맑음/흐림
      if (energy >= 4) {
        headline = '눈부신 햇살 아래, 갓생 돌파형 실행 처방 🚀';
        routineReason = '화창한 기상 컨디션과 폭발적인 체내 에너지가 시너지를 내는 날입니다. 야외 행동력을 극대화하고 가장 무겁고 어려운 일을 오늘 해결하세요!';
        routines = [
          '미루고 미뤘던 중요 작업(할 일) 오늘 오전 내로 승부 보기 🔥',
          '햇볕을 쬐며 15분 이상 빠른 걸음으로 야외 산책하기 👟',
          '업무 중간에 차가운 물 한 컵 원샷하고 주변 사람에게 가벼운 안부 전하기 🗣️'
        ];
        musicGenre = 'Uplifting Pop & Future Bass ⚡';
      } else {
        headline = '화창한 날의 리듬 회복형 충전 처방 🌿';
        routineReason = '외부 기상은 훌륭하나 에너지가 다소 저하되어 있습니다. 햇빛(비타민D)을 활용해 생체 리듬을 부드럽게 깨우고 활력을 환기하는 가벼운 활동이 필요합니다.';
        routines = [
          '점심 식사 후 10분 동안 의도적으로 햇빛 받으며 서있기 ☀️',
          '비타민 C가 들어간 과일 음료나 영양제 섭취하기 🍊',
          '좋아하는 가벼운 템포의 노래를 들으며 스트레칭하기 🎵'
        ];
        musicGenre = 'Bright R&B & City Pop 🌆';
      }
    }

    return { radarData, headline, routines, routineReason, musicGenre };
  }, [weather, energy, mood, focus]);

  const handlePrescribe = () => {
    setIsPrescribed(true);
    // Celebrate
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#f43f5e', '#3b82f6', '#f59e0b']
    });

    if (weather && routinePrescription) {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        condition: weather.condition,
        temp: weather.temp,
        energy,
        mood,
        focus,
        headline: routinePrescription.headline
      };
      
      const updated = [newItem, ...history].slice(0, 10);
      setHistory(updated);
      try {
        localStorage.setItem('harness_weather_history', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save history to localStorage', err);
      }
    }
  };

  const handleReset = () => {
    setIsPrescribed(false);
    setEnergy(3);
    setMood(3);
    setFocus(3);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('harness_weather_history', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to delete history from localStorage', err);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setEnergy(item.energy);
    setMood(item.mood);
    setFocus(item.focus);
    setIsPrescribed(true);
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.6 }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] text-slate-400 font-semibold tracking-wider animate-pulse">
        <Activity size={32} className="animate-spin text-purple-500 mb-4" />
        IP 기반 감성 날씨 감지 중...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] overflow-hidden py-12 px-4 md:px-8">
      {/* Dynamic Background Effects */}
      {weather?.condition === 'rainy' && (
        <div className="rain-container">
          {raindrops.map(drop => (
            <div 
              key={drop.id} 
              className="drop" 
              style={{ left: drop.left, animationDelay: drop.delay, animationDuration: drop.duration }}
            />
          ))}
        </div>
      )}
      
      {weather?.condition === 'sunny' && <div className="sunray-bg" />}

      {weather?.condition === 'snowy' && (
        <div className="snow-container">
          {snowflakes.map(flake => (
            <div 
              key={flake.id} 
              className="snowflake" 
              style={{ 
                left: flake.left, 
                animationDelay: flake.delay, 
                animationDuration: flake.duration,
                width: flake.size,
                height: flake.size
              }}
            />
          ))}
        </div>
      )}

      {weather?.condition === 'cloudy' && (
        <div className="cloud-container">
          <div className="fog-layer" />
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Fallback Warning Banner */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center gap-2 backdrop-blur-md">
            <AlertTriangle size={16} className="shrink-0" />
            <span>실시간 위치 및 날씨 API 호출 한도가 초과되었거나 네트워크 지연이 발생해 서울 기준 예시 데이터로 실행 중입니다.</span>
          </div>
        )}

        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Harness Bio-Weather System</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            Harness <span className="text-gradient-purple">Mood Weather</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto word-keep">
            오늘의 날씨와 바이오리듬을 기반으로 일상의 에너지를 200% 활용하는 갓생 행동 지침서
          </p>
        </header>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Weather Widget */}
          <div className="md:col-span-4 glass-panel p-6 flex flex-col justify-between min-h-[220px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-xs font-black uppercase tracking-wider">실시간 기상 감지</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  <MapPin size={10} className="text-purple-400" />
                  {location?.city}, {location?.country_name}
                </div>
              </div>
              
              <div className="flex items-center gap-4 my-4">
                {weather?.condition === 'rainy' && <CloudRain size={52} className="text-blue-400 animate-bounce" />}
                {weather?.condition === 'sunny' && <Sun size={52} className="text-amber-400 animate-pulse" />}
                {weather?.condition === 'cloudy' && <Cloud size={52} className="text-slate-400" />}
                {weather?.condition === 'snowy' && <Snowflake size={52} className="text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />}
                
                <div>
                  <div className="text-4xl font-black text-white">{weather?.temp}°C</div>
                  <div className="text-[10px] font-bold text-slate-400 capitalize">{weather?.condition} sky today</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center">
              <div>
                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-0.5">
                  <Thermometer size={10} /> 기온
                </div>
                <div className="text-white text-xs font-black">{weather?.temp}°C</div>
              </div>
              <div>
                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-0.5">
                  <Droplets size={10} /> 습도
                </div>
                <div className="text-white text-xs font-black">{weather?.humidity}%</div>
              </div>
              <div>
                <div className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-0.5">
                  <Wind size={10} /> 풍속
                </div>
                <div className="text-white text-xs font-black">{weather?.windSpeed}m/s</div>
              </div>
            </div>
          </div>

          {/* Form & Sliders or Radar / Result */}
          <div className="md:col-span-8 glass-panel p-6 flex flex-col justify-between min-h-[300px]">
            {!isPrescribed ? (
              // STEP 1: Input form
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-white font-black text-lg mb-1">내면 상태 자가 진단</h3>
                  <p className="text-slate-400 text-xs mb-6">오늘 본인의 내면 지수를 드래그해서 입력해 주세요.</p>
                  
                  <div className="space-y-6">
                    {/* Energy */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> 신체적 에너지</span>
                        <span className="text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{energy} / 5</span>
                      </div>
                      <input 
                        type="range" min="1" max="5" 
                        value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))} 
                      />
                    </div>
                    {/* Mood */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white flex items-center gap-1"><Smile size={14} className="text-rose-400" /> 감정 텐션</span>
                        <span className="text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{mood} / 5</span>
                      </div>
                      <input 
                        type="range" min="1" max="5" 
                        value={mood} onChange={(e) => setMood(parseInt(e.target.value))} 
                      />
                    </div>
                    {/* Focus */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-white flex items-center gap-1"><Target size={14} className="text-cyan-400" /> 인지적 몰입도</span>
                        <span className="text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{focus} / 5</span>
                      </div>
                      <input 
                        type="range" min="1" max="5" 
                        value={focus} onChange={(e) => setFocus(parseInt(e.target.value))} 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePrescribe}
                  className="w-full mt-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-rose-500 text-white font-black text-sm tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  오늘의 처방 생성하기 <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              // STEP 2: Prescribed Result
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider block mb-1">Prescription Output</span>
                      <h3 className="text-white font-black text-lg word-keep">{routinePrescription?.headline}</h3>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                      title="처방 초기화"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1 flex items-center gap-1"><Activity size={10} className="text-purple-400" /> 바이오-웨더 싱크 진단</p>
                    <p className="text-slate-300 text-xs leading-relaxed font-semibold word-keep">{routinePrescription?.routineReason}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">🎯 행동 권장 루틴 (Routines)</p>
                    {routinePrescription?.routines.map((routine, i) => (
                      <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-400 shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-white/95 text-xs font-bold">{routine}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <Coffee size={24} className="text-yellow-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold block">권장 음료/푸드</span>
                        <span className="text-white text-xs font-black">{weather?.condition === 'rainy' ? '허브티 🍵' : '시트러스 주스 🍊'}</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                      <BookOpen size={24} className="text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold block">음악 가이드</span>
                        <span className="text-white text-xs font-black">{routinePrescription?.musicGenre}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Radar Chart Panel */}
          {isPrescribed && (
            <div className="col-span-1 md:col-span-12 glass-panel p-6 flex flex-col items-center justify-center">
              <h3 className="text-white font-black text-sm mb-6 flex items-center gap-1.5 self-start">
                <Activity size={14} className="text-purple-400" /> 바이오 에너지 지수 (9-Radar)
              </h3>
              
              <div className="w-full h-[280px] sm:h-[320px] max-w-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "65%" : "80%"} data={routinePrescription?.radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                    <Radar 
                      name="Bio-Weather Energy" 
                      dataKey="A" 
                      stroke="#a855f7" 
                      fill="#a855f7" 
                      fillOpacity={0.25} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

        {/* History Archive Panel */}
        {history.length > 0 && (
          <div className="mt-8 glass-panel p-6">
            <h3 className="text-white font-black text-sm mb-4 flex items-center gap-1.5">
              <Activity size={14} className="text-purple-400" /> 지난 처방 보관소 ({history.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelectHistory(item)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between min-h-[110px]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-slate-500 font-bold">{item.date}</span>
                      <button 
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="p-1 rounded-md bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <div className="text-white text-xs font-black line-clamp-1 mb-2">{item.headline}</div>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      {item.condition === 'rainy' && <CloudRain size={10} className="text-blue-400" />}
                      {item.condition === 'sunny' && <Sun size={10} className="text-amber-400" />}
                      {item.condition === 'cloudy' && <Cloud size={10} className="text-slate-400" />}
                      {item.condition === 'snowy' && <Snowflake size={10} className="text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />}
                      {item.temp}°C
                    </span>
                    <span>평균 지수: {Math.round((item.energy + item.mood + item.focus)/3 * 20)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Adsense Pass Column Section */}
        <AdsensePassSection />

        {/* Footer */}
        <footer className="text-center mt-12 pb-8 border-t border-white/5 pt-8 text-slate-500 text-[10px] uppercase tracking-widest">
          <div className="flex justify-center gap-6 mb-4 text-[11px] font-bold text-slate-400">
            <a href="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          &copy; 2026 Harness Systems. All Rights Reserved.
        </footer>

      </div>
    </div>
  );
}
