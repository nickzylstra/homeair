import React, { useEffect } from 'react';

const loadWidgets = () => {
  const script = document.createElement('script');
  script.src = 'https://www.purpleair.com/pa.widget.js?key=L1C8TB907ZEZE9TJ&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard';
  script.id = 'PAWidgetScript';
  document.body.appendChild(script);

  const scriptOut1 = document.createElement('script');
  scriptOut1.src = 'https://www.purpleair.com/pa.widget.js?key=C1VSSQPBP6SE2NZT&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_63513_module_AQI_conversion_C5_average_10_layer_standard';
  scriptOut1.id = 'PAWidgetScriptOut1';
  document.body.appendChild(scriptOut1);

  const scriptOut2 = document.createElement('script');
  scriptOut2.src = 'https://www.purpleair.com/pa.widget.js?key=EMIMM5D86RP2W9XB&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_62421_module_AQI_conversion_C5_average_10_layer_standard';
  scriptOut2.id = 'PAWidgetScript2';
  document.body.appendChild(scriptOut2);
};

function CurrentStatus() {
  useEffect(() => {
    loadWidgets();
  }, []);
  return (
    <div style={{ display: 'flex' }}>
      <span id="PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard" />
      <span id="PurpleAirWidget_63513_module_AQI_conversion_C5_average_10_layer_standard" />
      <span id="PurpleAirWidget_62421_module_AQI_conversion_C5_average_10_layer_standard" />
    </div>
  );
}

export default CurrentStatus;
