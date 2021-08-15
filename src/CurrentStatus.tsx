// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useEffect } from 'react';

const loadWidgets = () => {
  const widgetHome = document.createElement('script');
  widgetHome.src = 'https://www.purpleair.com/pa.widget.js?key=L1C8TB907ZEZE9TJ&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard';
  widgetHome.id = 'PAWidgetScript';
  document.body.appendChild(widgetHome);

  const widgetNeighbor1 = document.createElement('script');
  widgetNeighbor1.src = 'https://www.purpleair.com/pa.widget.js?key=IYK4R5V4JG2FZA6T&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_2856_module_AQI_conversion_C5_average_10_layer_standard';
  widgetNeighbor1.id = 'PAWidgetScriptOut1';
  document.body.appendChild(widgetNeighbor1);

  const widgetNeighbor2 = document.createElement('script');
  widgetNeighbor2.src = 'https://www.purpleair.com/pa.widget.js?key=UGXESE5LBNFCLG8O&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_82995_module_AQI_conversion_C5_average_10_layer_standard';
  widgetNeighbor2.id = 'PAWidgetScript2';
  document.body.appendChild(widgetNeighbor2);
};

function CurrentStatus() {
  useEffect(() => {
    loadWidgets();
  }, []);
  return (
    <div style={{ display: 'flex' }}>
      <span id="PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard" />
      <span id="PurpleAirWidget_2856_module_AQI_conversion_C5_average_10_layer_standard" />
      <span id="PurpleAirWidget_82995_module_AQI_conversion_C5_average_10_layer_standard" />
    </div>
  );
}

export default CurrentStatus;
