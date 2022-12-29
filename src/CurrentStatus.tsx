// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useEffect } from 'react';
import { Col } from 'react-bootstrap';

const loadWidgets = () => {
  const widgetHome = document.createElement('script');
  widgetHome.src =
    'https://www.purpleair.com/pa.widget.js?key=L1C8TB907ZEZE9TJ&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard';
  widgetHome.id = 'PAWidgetScript';
  document.body.appendChild(widgetHome);

  const widgetNeighbor1 = document.createElement('script');
  widgetNeighbor1.src =
    'https://www.purpleair.com/pa.widget.js?key=XG7VT13OVHWF7Y79&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_159749_module_AQI_conversion_C5_average_10_layer_standard';
  widgetNeighbor1.id = 'PAWidgetScriptOut1';
  document.body.appendChild(widgetNeighbor1);

  const widgetNeighbor2 = document.createElement('script');
  widgetNeighbor2.src =
    'https://www.purpleair.com/pa.widget.js?key=IYK4R5V4JG2FZA6T&module=AQI&conversion=C5&average=10&layer=standard&container=PurpleAirWidget_2856_module_AQI_conversion_C5_average_10_layer_standard';
  widgetNeighbor2.id = 'PAWidgetScript2';
  document.body.appendChild(widgetNeighbor2);
};
<div id="PurpleAirWidget_159749_module_AQI_conversion_C5_average_0_layer_standard">
  Loading PurpleAir Widget...
</div>;
function CurrentStatus() {
  useEffect(() => {
    loadWidgets();
  }, []);
  return (
    <>
      <Col>
        <span id="PurpleAirWidget_68841_module_AQI_conversion_C5_average_10_layer_standard" />
      </Col>
      <Col>
        <span id="PurpleAirWidget_159749_module_AQI_conversion_C5_average_10_layer_standard" />
      </Col>
      <Col>
        <span id="PurpleAirWidget_2856_module_AQI_conversion_C5_average_10_layer_standard" />
      </Col>
    </>
  );
}

export default CurrentStatus;
