import React, { useEffect } from 'react';

const loadWidget = () => {
  const existingScript = document.getElementById('PAWidgetScript');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://www.purpleair.com/pa.widget.js?key=L1C8TB907ZEZE9TJ&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard';
    script.id = 'PAWidgetScript';
    document.body.appendChild(script);
  }
};

function CurrentStatus() {
  useEffect(() => {
    loadWidget();
  }, []);
  return (
    <div id="PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard" />
  );
}

export default CurrentStatus;
