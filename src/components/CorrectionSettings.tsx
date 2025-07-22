import React from 'react';

interface CorrectionSettingsProps {
  correctionItems: { key: string; label: string }[];
  types: { key: string; label: string; color: string }[];
  correctionRange: any;
  setCorrectionRange: (r: any) => void;
  saveAdjustment: (range: any) => Promise<any>;
  saveAdjustmentHistory: (range: any, savedAt: number) => void;
  setShowCorrectionSetting: (show: boolean) => void;
}

const CorrectionSettings: React.FC<CorrectionSettingsProps> = ({
  correctionItems,
  types,
  correctionRange,
  setCorrectionRange,
  saveAdjustment,
  saveAdjustmentHistory,
  setShowCorrectionSetting,
}) => {
  return (
    <div className="flex flex-col gap-8">
      {correctionItems.map(item => (
        <div key={item.key}>
          <div className="font-bold text-lg mb-4">
            {item.label}
            <sup className="ml-2 text-xs text-gray-400 sup-top-align">(어제대비)</sup>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {types.map(type => (
              <div key={type.key} className="bg-[#232329] rounded-2xl p-6 flex flex-col items-center shadow-lg border border-white/10 min-w-[220px]">
                <span className={`font-semibold text-lg mb-2 text-${type.color}-400`}>{type.label}</span>
                <div className="relative w-full flex flex-col items-center mb-2">
                  <Slider
                    range
                    min={0}
                    max={100}
                    value={[
                      correctionRange[`${item.key}${type.key}Min`] ?? 0,
                      correctionRange[`${item.key}${type.key}Max`] ?? 100
                    ]}
                    onChange={value => {
                      if (Array.isArray(value)) {
                        const [newMin, newMax] = value;
                        setCorrectionRange((r: any) => ({
                          ...r,
                          [`${item.key}${type.key}Min`]: newMin,
                          [`${item.key}${type.key}Max`]: newMax,
                        }));
                      }
                    }}
                    trackStyle={[{ backgroundColor: type.color === 'green' ? '#22c55e' : type.color === 'blue' ? '#3b82f6' : '#ef4444', height: 8 }]}
                    handleStyle={[
                      { borderColor: '#fff', backgroundColor: type.color === 'green' ? '#22c55e' : type.color === 'blue' ? '#3b82f6' : '#ef4444', width: 24, height: 24, marginTop: -8, boxShadow: '0 0 0 4px #fff4' },
                      { borderColor: '#fff', backgroundColor: type.color === 'green' ? '#22c55e' : type.color === 'blue' ? '#3b82f6' : '#ef4444', width: 24, height: 24, marginTop: -8, boxShadow: '0 0 0 4px #fff4' }
                    ]}
                    railStyle={{ backgroundColor: '#374151', height: 8, borderRadius: 8 }}
                    allowCross={false}
                    pushable={1}
                  />
                  <div className="flex justify-between w-full mt-2 text-xs">
                    <span className={`text-${type.color}-300`}>{correctionRange[`${item.key}${type.key}Min`] ?? 0}%</span>
                    <span className={`text-${type.color}-300`}>{correctionRange[`${item.key}${type.key}Max`] ?? 100}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-4 mt-8">
        <button
          className="px-6 py-2 rounded text-sm font-bold bg-green-500 text-white transition"
          onClick={() => {
            saveAdjustment(correctionRange).then(() => {
              saveAdjustmentHistory(correctionRange, Date.now());
              alert("보정치가 Firestore에 저장되었습니다!");
              setShowCorrectionSetting(false);
            });
          }}
        >
          보정치 저장
        </button>
        <button
          className="px-6 py-2 rounded text-sm font-bold bg-gray-500 text-white transition"
          onClick={() => setCorrectionRange({})}
        >
          초기화
        </button>
        <button
          className="px-6 py-2 rounded text-sm font-bold bg-gray-600 text-white transition"
          onClick={() => { setShowCorrectionSetting(false); }}
        >
          취소
        </button>
      </div>
    </div>
  );
};

// Slider import
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default CorrectionSettings; 