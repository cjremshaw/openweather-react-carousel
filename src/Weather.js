import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Weather extends React.Component {
  let apiKey = ''; // ADD YOUR API KEY HERE
  constructor(props) {
    super(props);
    this.state = { weatherData: [], isInitialized: false, isFetching: false, zipcode: undefined, error: undefined};
    this._getWeather = this._getWeather.bind(this);
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._updateZip = this._updateZip.bind(this);
  }

   _getWeather = () => {
     this.setState({isFetching: true});

     // 56645240fb8557e9181df32fae1de3ad

     if ( this.state.zipcode !== undefined && this.state.zipcode.length === 5 && !isNaN(this.state.zipcode) ) {
       fetch('https://api.openweathermap.org/data/2.5/forecast?zip=' + this.state.zipcode + ',us&APPID=' + apiKey + '&units=imperial')
            .then(response => {
         if ( !response.ok) {
           throw Error( response.status + " : " + response.statusText )
         }
         return response;
       })
       .then(data => data.json())
       .then(data => this.setState({ weatherData: data, isFetching: false, isInitialized: true }))
       .catch( e => this.setState({error: e, isFetching: false}));
     }
  }

  componentDidMount() {
    if ( this.state.zipcode !== undefined && this.state.zipcode.length === 5 && !isNaN(this.state.zipcode) ) {
      this._getWeather();
    }
  }

  _handleKeyDown = (e) => {
    if ( e.key === 'Enter' ) {
      this._getWeather();
    }
  }

  _updateZip = (event) => {
    this.setState({zipcode: event.target.value});
  }

  render() {
    if ( this.state.error ) {
      console.log(this.state.error);
      return ( <p>{this.state.error.message}</p> );
    }  
    
    if ( this.state.isFetching ) {
      return ( <p>Loading</p> );
    }
   
    if ( this.state.weatherData.city !== undefined ) {
      return (
        <div>
         <Location data={this.state.weatherData} />
         <Carousel items={this.state.weatherData.list} active={2} data={this.state.weatherData} />
         Zipcode: <input type="text" 
                         name="zipcode" 
                         onChange={this._updateZip} 
                         onKeyDown={this._handleKeyDown} />
        </div>
      );
    }

    return ( 
         <div><p>Enter a zipcode</p>
         Zipcode: <input type="text" 
                         name="zipcode" 
                         onChange={this._updateZip} 
                         onKeyDown={this._handleKeyDown} /></div>
    );
  }
}

class Location extends React.Component {
  constructor(props) {
    super(props);
    this.state = {weatherData: props.data};
  }

  render() {
    if ( this.state.weatherData.city === undefined ) {
      return (
        <h2>Loading</h2>
      );
    }
    return (
      <h2>{this.state.weatherData.city.name} weather forecast</h2>
    );
  }
}

class FiveDayThreeHourForecast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {weatherData: props.data};
  }

  render() {
    if ( this.state.weatherData.list === undefined ) {
      return (
         <div />
      );
    }
    const forecastWindow = this.state.weatherData.list.map((forecast) =>
      <ForecastWindow key={forecast.dt} data={forecast} />);

    return (
      <div class="scrolling-wrapper">
       {forecastWindow}
      </div>      
    );      
  }
} 

class ForecastWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      weatherData: props.data,
      level: props.level
    }
  }

  hex = (value) => {
    let s = "01234567890abcdef";
    let i = Math.min(256,Math.max(0,value));
    return s.charAt((i - i % 16)/16) + s.charAt(i % 16);
  }

  render() {
    if ( this.state.weatherData === undefined ) {
      return( <p /> );
    }
     
    const forecastDate = new Date(this.state.weatherData.dt*1000);
    const nowDate = new Date(Date.now());

    let displayDay;

    if ( forecastDate.getFullYear() === nowDate.getFullYear() && 
         forecastDate.getMonth() === nowDate.getMonth() &&
         forecastDate.getDate() === nowDate.getDate() ) {
      displayDay = "Today";
    } else {
      var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      displayDay = dayNames[forecastDate.getDay()];
    }
    let displayHour;
    if ( forecastDate.getHours() === 0 ) {
      displayHour = "Midnight";
    } else if ( forecastDate.getHours() === 12 ) {
      displayHour = "Noon";
    } else {
      displayHour = (forecastDate.getHours()%12) + (forecastDate.getHours() >= 12 ? " PM" : " AM");
    }
    const temperature = Math.round(this.state.weatherData.main.temp);
    const forecastDisplayDate = (forecastDate.getMonth()+1) + "/" + forecastDate.getDate();
    let s = "0123456789abcdef";
    let rgbColor=[];

    // 72+ - red with FF = 120 (relative: 48)
    rgbColor[0] = Math.round(Math.min(256,Math.max(0,temperature-72)*256/48)); 
 
    // Green is maxed when temp = 72 and 0 at the extremes (hot or cold)
    rgbColor[2] = Math.max(0,128 - Math.max(rgbColor[0],rgbColor[1]));

    // below 72 - blue with FF = -40 (relative: -112)
    rgbColor[1] = Math.round(Math.min(256,Math.max(0,temperature*-1+72)*256/112));

    let bgColor = "#" + this.hex(rgbColor[0]) + this.hex(rgbColor[1]) + this.hex(rgbColor[2]);
          
    return ( 
      <div className={"item level" + this.props.level} style={{backgroundColor: bgColor}}> 
       <div>{displayDay} {displayHour}</div>
       <div>{forecastDisplayDate}</div>       
       <img alt={this.state.weatherData.weather[0].description} src={"http://openweathermap.org/img/wn/" + this.state.weatherData.weather[0].icon + ".png"} /><br />
       {temperature }&deg; F<br/>
       {this.state.weatherData.weather[0].description}<br/>
      </div> 
    );
  }
}

class Carousel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.items,
      active: this.props.active,
      data: this.props.data,
      direction: ''
    }
    this.rightClick = this.moveRight.bind(this)
    this.leftClick = this.moveLeft.bind(this)
  }

  generateItems() {
    var items = []
    var level
    console.log(this.state.active)
    for (var i = this.state.active - 2; i < this.state.active + 3; i++) {
      var index = i
      if (i < 0) {
        index = this.state.items.length + i
      } else if (i >= this.state.items.length) {
        index = i % this.state.items.length
      }
      level = this.state.active - i
      items.push(<ForecastWindow key={index} data={this.state.items[index]} id={this.state.items[index]} level={level} />)
    }
    return items
  }
    
  moveLeft() {
    var newActive = this.state.active
    newActive--
    this.setState({
      active: newActive < 2 ? this.state.active : newActive,
      direction: 'left'
    })
  }
    
  moveRight() {
    var newActive = this.state.active
    this.setState({
      active: newActive+1 >= this.state.items.length-2 ? newActive : newActive + 1,
      direction: 'right'
    })
  }
    
  render() {
    return(
      <div id="carousel" className="noselect">
       <div className="arrow arrow-left" onClick={this.leftClick}><i className="fi-arrow-left">&lt;</i></div>
        <ReactCSSTransitionGroup 
          transitionName={this.state.direction}
	  transitionEnterTimeout={100}
	  transitionLeaveTimeout={100}>
         {this.generateItems()}
        </ReactCSSTransitionGroup>
       <div className="arrow arrow-right" onClick={this.rightClick}><i className="fi-arrow-right">&gt;</i></div>
      </div>
    )
  }
}

class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      level: this.props.level
    }
  }
    
  render() {
    const className = 'item level' + this.props.level
    return (
      <div className={className}>
       {this.props.id}
      </div>
    )
  }
}

export default Weather;
