import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Header from "./Header";
import "./App.css";
import moment from "moment";

function App() {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [plotData, setPlotData] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [today, setToday] = React.useState(moment().format("YYYY-MM-DD"));
  const [params, setParams] = React.useState({});

  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const fetchData = (e) => {
    e.preventDefault();
    setLoading(true);
    const api_key = process.env.REACT_APP_API_KEY;
    fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${api_key}`
    )
      .then((res) => res.json())
      .then((data) => {
        getPlotData(data.near_earth_objects);
        setStats(data);
      });
  };

  const getPlotData = (resData) => {
    if (!resData) return;
    const countArr = Object.values(resData).map((ele) => {
      return ele.length;
    });
    const labels = Object.keys(resData);
    const data = {
      labels,
      dataSets: [
        {
          label: "Number of Asteroids Close To Earth",
          data: countArr,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "#0b3c91db",
        },
      ],
    };
    setLoading(false);
    setPlotData(data);
  };

  const isEmptyPlotData = () => !loading && JSON.stringify(plotData) === "{}";

  const setStats = (data) => {
    const params = {};
    params.totalCount = data.element_count;
    let maxSpeed = 0;
    let minDistance = Object.values(data.near_earth_objects)[0][0]
      .close_approach_data[0].miss_distance.kilometers;
    let avgSize=0;

    Object.values(data.near_earth_objects).forEach((dateArray) => {
      return dateArray.forEach((asteroid) => {
        const speed =
          asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour;

        const distance =
          asteroid.close_approach_data[0].miss_distance.kilometers;
        const maxSize =
          asteroid.estimated_diameter.kilometers.estimated_diameter_max
          const minSize =
            asteroid.estimated_diameter.kilometers.estimated_diameter_min;
            const size= (maxSize+minSize)/2.0
        console.log(size)
        avgSize+=size
        if (speed > maxSpeed) maxSpeed = speed;
        if (distance < minDistance) minDistance = distance;
      });
    });
    params.avgSize = parseFloat(avgSize / data.element_count).toFixed(2);
    params.maxSpeed = parseFloat(maxSpeed).toFixed(2);
    params.minDistance = parseFloat(minDistance).toFixed(2);
    console.log({ data, maxSpeed, params });

    setParams(params);

  };

  return (
    <div className="App">
      <Header />
      <div>
        <form
          className="datePickerBox"
          onSubmit={(e) => {
            fetchData(e);
          }}
        >
          <div className="dateInputForm">
            <div>
              <label>Select Start Date:</label>
              <br />
              <input
                type="date"
                required
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
              />
            </div>
          </div>
          <div className="dateInputForm">
            <div>
              <label>Select End Date:</label>
              <br />
              <input
                type="date"
                required
                min={startDate}
                max={moment(startDate).add(7, "days").format("YYYY-MM-DD")}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary submitButton">Go</button>
        </form>
      </div>
      <div className="row">
        <div className="col-lg-8">
          <div className="chartDisplay">
            {!isEmptyPlotData() ? (
              !loading ? (
                <Line
                  data={{
                    labels: plotData.labels || [],
                    datasets: plotData.dataSets || [],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Asteroids Near Earth By Date",
                        color: "black",
                      },
                    },
                  }}
                ></Line>
              ) : (
                <div className="loadingSpinner">
                  <label>Loading Graph..</label>
                  <br />
                  <div className="spinner-border text-primary"></div>
                </div>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="analysis_data">
            <h4>Neo Stats</h4>
            <p>
              Total Asteroids Count: <strong>{params.totalCount||0}</strong>
            </p>
            <p>
              Fastest Asteroid Velocity: <strong>{params.maxSpeed||0} km/h</strong>
            </p>
            <p>
              Closest Asteroid Distance: <strong>{params.minDistance||0} km</strong>
            </p>
            <p>
              Average Size of Asteroids: <strong>{params.avgSize||0} km</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
