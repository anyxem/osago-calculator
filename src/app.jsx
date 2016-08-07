import React from 'react';
import { render } from 'react-dom';

import DropDown, { Item } from './components/Dropdown'

import './app.styl';
import './components/Checkboxes.styl';
import './components/Radio.styl';
import './components/Tooltip.styl';

import { OWNER } from './const/owner.js';
import { POWER } from './const/power.js';
import { CITIES } from './const/cities.js';
import { RANGE } from './const/range.js';
import { TS } from './const/ts.js';
import { BMS } from './const/bms.js';
import { EXPERIENCE } from './const/experience.js';
import { AGE } from './const/age.js';

const NEW_DRIVER = {
  age: 18,
  experience: 1,
  bms: 'm',
}

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      view: 'calc',
      base: window.base || 1000,
      ownerIsJur: 0,
      region: 1,
      city: 0,
      ts: 1,
      power: 1,
      range: 3,
      withTralier: false,
      multiDriver: false,
      multiDriverBMS: 'm',
      driverList: [
        {
          age: 18,
          experience: 1,
          bms: 'm',
        },
      ],
    };

console.log(POWER);
    this.addDriver = this.addDriver.bind(this);
    this.toggleTrailer = this.toggleTrailer.bind(this);
    this.toggleDriver = this.toggleDriver.bind(this);
  }

  toggleTrailer() {
    this.setState({ withTralier : !this.state.withTralier });
  }

  toggleDriver() {
    this.setState({ multiDriver : !this.state.multiDriver });
  }

  addDriver(e) {
    e.preventDefault();
    let drivers = this.state.driverList;
    drivers.push(NEW_DRIVER);
    this.setState( {driverList: drivers} );
  }

  render() {

    let regions = {};
    for( let row in CITIES ){
      regions[row] = {label: CITIES[row][0][3] };
    }
    console.log(CITIES[this.state.region]);

    let citiesOfRegion = {};
    for( let i = 0; i < CITIES[this.state.region].length ; i++ ){
      citiesOfRegion[i] = { label: CITIES[this.state.region][i][0] };
    }


    let multiplies = []
    multiplies = [
      {
        key: `КТ
        (терр.)`,
        value: CITIES[this.state.region][this.state.city][(this.state.ts == 10 ? 2 : 1)]
      },
      {
        key: `КБМ
        (бонус-малус)`,
        value: BMS[this.state.multiDriverBMS].k,
      },
      {
        key: `КВС
        (возраст-стаж)`,
        value: 1,
      },
      {
        key: `КС
        (период использования)`,
        value:RANGE[this.state.range].k
      },
      {
        key: `КП
        (срок страхования)`,
        value: 1
      },
      {
        key: `КМ
        (мощность)`,
        value: POWER[this.state.power].k
      }
    ];

    return (
      <div className="calculator-osago">
        <h1>Калькулятор ОСАГО</h1>
        <div className="form-group">
          <div className="title">Собственник транспортного средства</div>
          <DropDown
            options={OWNER}
            value={this.state.ownerIsJur}
            label={OWNER[this.state.ownerIsJur].label}
            onChange={(id) => (this.setState({ ownerIsJur: id }))}
          />
        </div>
        <div className="form-group">
          <div className="title">Регион прописки собственника</div>
          <DropDown
            options={regions}
            value={this.state.region}
            label={regions[this.state.region].label}
            onChange={(id) => (this.setState({ region: id, city: 0 }))}
          />
        </div>

        <div className="form-group">
          <div className="title">Город</div>
          <DropDown
            options={citiesOfRegion}
            value={this.state.city}
            label={citiesOfRegion[this.state.city].label}
            onChange={(id) => (this.setState({ city: id }))}
          />
        </div>

        <div className="form-group">
          <div className="title">Транспортное средство</div>
          <DropDown
            options={TS}
            value={this.state.ts}
            label={TS[this.state.ts].label}
            onChange={(id) => (this.setState({ ts: id }))}
          />
        </div>

        <div className="form-group">
          <div className="title">Мощность двигателя</div>
          <DropDown
            options={POWER}
            value={this.state.power}
            label={POWER[this.state.power].label}
            onChange={(id) => (this.setState({ power: id }))}
          />
        </div>

        <div className="form-group">
          <div className="title">Период использования</div>
          <DropDown
            options={RANGE}
            value={this.state.range}
            label={RANGE[this.state.range].label}
            onChange={(id) => (this.setState({ range: id }))}
          />
        </div>


        <div className="form-group -full">
          <input type="checkbox" onChange={this.toggleTrailer} id="withTrailer" />
          <label htmlFor="withTrailer">Будет использоваться с прицепом</label>
        </div>

        <h2>Список водителей</h2>

        <div className="form-group -full">
          <input type="checkbox" onChange={this.toggleDriver} id="multiDriver" />
          <label htmlFor="multiDriver">Неограниченное число водителей (мультидрайв)</label>
        </div>
        {
          this.state.multiDriver ?
          (
            <div className="row-group">
              <div className="form-group -full">
                <div className="title">Коэффициент безаварийности (<a href="#">проверить</a>) <a href="#" className="ico-q" data-tooltip="КБМ, коэфициент бонус-малус, определяется по единой базе РСА, в которой зафиксированы прошлые страховые случаи (ДТП) по водителю. Для страхующихся впервые равен единице (класс 3)"></a></div>
                <DropDown
                  options={BMS}
                  value={this.state.multiDriverBMS}
                  label={BMS[this.state.multiDriverBMS].label}
                  onChange={(id) => (this.setState({ multiDriverBMS: id }))}
                />
              </div>
            </div>
          )
          :
          this.state.driverList.map(function(item,index){
            return (
              <div className="row-group">
                <div className="form-group -half">
                  <div className="title">Возраст</div>
                  <DropDown
                    options={AGE}
                    value={item.age}
                    label={AGE[item.age].label}
                    onChange={(id) => {let driverList = this.state.driverList; driverList[index].age = id; this.setState({ driverList: driverList })}}
                  />
                </div>
                <div className="form-group -half">
                  <div className="title">Стаж</div>
                  <DropDown
                    options={EXPERIENCE}
                    value={item.experience}
                    label={EXPERIENCE[item.experience].label}
                    onChange={(id) => {let driverList = this.state.driverList; driverList[index].experience = id; this.setState({ driverList: driverList })}}
                  />
                </div>
                <div className="form-group -double">
                  <div className="title">Коэффициент безаварийности (<a href="#">проверить</a>) <a href="#" className="ico-q" data-tooltip="КБМ, коэфициент бонус-малус, определяется по единой базе РСА, в которой зафиксированы прошлые страховые случаи (ДТП) по водителю. Для страхующихся впервые равен единице (класс 3)"></a></div>
                  <DropDown
                    options={BMS}
                    value={item.bms}
                    label={BMS[item.bms].label}
                    onChange={(id) => {let driverList = this.state.driverList; driverList[index].bms = id; this.setState({ driverList: driverList })}}
                  />
                </div>
              </div>
            );
          }, this)
        }

        {
          !this.state.multiDriver &&
          (
            <div className="form-group -full">
              <a href="#" className="add" onClick={this.addDriver}>Добавить еще одного водителя</a>
            </div>
          )
        }


        <button>Рассчитать</button>

        <h1>Стоимость полиса ОСАГО</h1>

        <div className="price">30 000 ₽</div>

        <div className="base-price">Базовый тариф: <span className="number">{typeof this.state.base === 'number' ? this.state.base : (this.state.base[0]+' - '+this.state.base[1])} ₽</span></div>

        <div className="table">
          {
            multiplies.map(function(cell) {
              return (
                <div className="cell">
                  <div className="key">
                    {cell.key}
                  </div>
                  <div className="value">
                    {cell.value}
                  </div>
                </div>
              );
            })
          }
        </div>


        <div className="form-group -full">
          <a href="#" className="back">Рассчитать еще раз</a>
        </div>

        <button>Заказать полис ОСАГО с бесплатной доставкой</button>

      </div>
    );
  }
}


render((
  <App />
), document.getElementById('root'));
