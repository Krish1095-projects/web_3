import React from 'react';
import ReactApexChart from 'react-apexcharts';

class BarChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [],
      options: {
        chart: {
          type: 'bar',
          width: 350
        },
        plotOptions: {
          bar: {
            horizontal: true,
            colors: {
              ranges: [{
                from: 0,
                to: 100,
                color: '#16a34a'
              }, {
                from: -100,
                to: 0,
                color: '#dc2626'
              }]
            },
            barHeight: '80%'
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: [],
          labels: {
            rotate: -90
          }
        },
        yaxis: {
          title: {
            text: 'Values'
          }
        },
        colors: []
      }
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const chartData = nextProps.data.map(([word, value]) => ({
      x: word,
      y: value,
    }));

    return {
      series: [
        {
          name: 'Values',
          data: chartData
        }
      ],
      options: {
        ...prevState.options,
        xaxis: {
          ...prevState.options.xaxis,
          categories: chartData.map(item => item.x)
        },
        colors: chartData.map(item => {
          if (item.y >= -1 && item.y < 0) {
            return '#FF0000'; // Red for values between -1 and 0
          } else if (item.y >= 0 && item.y <= 1) {
            return '#00FF00'; // Green for values between 0 and 1
          } else {
            return '#000000'; // Default color for other values
          }
        })
      }
    };
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="bar"
          height={350}
        />
      </div>
    );
  }
}

export default BarChart;
