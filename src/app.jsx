import React from 'react';
import { render } from 'react-dom';
import $ from 'jquery';
import InputElement  from 'react-input-mask';

import DropDown, { Item } from './components/Dropdown';

import './app.styl';
import './components/Checkboxes.styl';
import './components/Radio.styl';
import './components/Tooltip.styl';
import './components/Modal.styl';

import { OWNER } from './const/owner.js';
import { POWER } from './const/power.js';
import { CITIES } from './const/cities.js';
import { RANGE } from './const/range.js';
import { TS } from './const/ts.js';
import { BMS } from './const/bms.js';
import { EXPERIENCE } from './const/experience.js';
import { AGE } from './const/age.js';

const NEW_DRIVER = {
  age: 23,
  experience: 3,
  bms: 1,
};

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      view: 'calc',
      customBase: window.customBase || null,
      ownerIsJur: 0,
      base: 0,
      region: 1,
      city: 0,
      ts: 3,
      power: 5,
      range: 10,
      withTrailer: false,
      multiDriver: false,
      multiDriverBMS: 1,
      sender: window.sender || '/wp-content/plugins/osago-calc/public/contact_me.php',
      marketingHtml: window.marketingHtml || '',
      calcId: window.calcId || null,
      calcTitle: window.calcTitle || null,
      checkBmsLink: window.checkBmsLink || 'http://avto-yslyga.ru/proverit-kbm-osago/',
      driverList: [
        NEW_DRIVER,
      ],
      name: null,
      nameErr: false,
      phone: null,
      phoneErr: false,
      callbackTriggerSend: window.callbackTriggerSend || null,
      callbackTriggerCalc: window.callbackTriggerCalc || null,
    };

    this.addDriver = this.addDriver.bind(this);
    this.toggleTrailer = this.toggleTrailer.bind(this);
    this.toggleDriver = this.toggleDriver.bind(this);
    this.handleSetTS = this.handleSetTS.bind(this);
    this.sendOrder = this.sendOrder.bind(this);
  }

  componentDidMount() {
    this.handleSetTS(this.state.ts);
  }

  sendOrder() {
    let payload = [];

    let err = {};
    if(this.state.name === null || this.state.name.length < 1){
      err.nameErr = true;
    }

    if(this.state.phone === null || this.state.phone.toString().length < 1){
      err.phoneErr = true;
    }

    if(err.nameErr || err.phoneErr){
      this.setState(err);
      return;
    }


let regions = {};
for( let row in CITIES ){
  regions[row] = {label: CITIES[row][0][3] };
}

let citiesOfRegion = {};
for( let i = 0; i < CITIES[this.state.region].length ; i++ ){
  citiesOfRegion[i] = { label: CITIES[this.state.region][i][0] };
}

    let payloadinfo = []
    payloadinfo = [
      {
        key: `Собственник транспортного средства`,
        label: OWNER[this.state.ownerIsJur].label
      },
      {
        key: `Регион прописки собственника`,
        label: regions[this.state.region].label
      },
      {
        key: `Город`,
        label: citiesOfRegion[this.state.city].label
      },
      {
        key: `Транспортное средство`,
        label: TS[this.state.ts].label
      },
      {
        key: `Мощность двигателя`,
        label: POWER[this.state.power].label
      },
      {
        key: `Период использования`,
        label: RANGE[this.state.range].label
      },
      {
        key: `Будет использоваться с прицепом`,
        label: ( this.state.withTrailer ? 'да' : 'нет' ),
      },
    ];


    if(this.state.multiDriver){
      payloadinfo.push({
        key: `Водители`,
        label: 'Будет использоваться мультидрайв'
      });
    }else{
      payloadinfo.push({
        key: `Водители`,
        label: `${ this.state.driverList.map(function(item,index){
          return (`
            ${~~index+1}<br/>
            Возраст: ${AGE[item.age].label} <br/>
            Опыт: ${EXPERIENCE[item.experience].label} <br/>
            КБМ: ${BMS[item.bms].label} <br/>
            `);
        }).join('') }`
      });
    }

    payload = payloadinfo.map(function(item,index){
      return (~~index+1)+'. '+item.key+': '+item.label+'<br/>';
    }).join('\n');



    let multiplies = []
    multiplies = [
      {
        key: `КТ
        (терр.)`,
        value: CITIES[this.state.region][this.state.city][(this.state.ts == 11 ? 2 : 1)],
        label: CITIES[this.state.region][this.state.city][0]
      },
      {
        key: `КБМ
        (бонус-малус)`,
        value: this.calcKBM(),
        label: 'Коэфф '+this.calcKBM(),
      },
      {
        key: `КО
        (мульти-драйв)`,
        value: ( this.state.multiDriver ? 1.8 : 1 ),
        label: ( this.state.multiDriver ? 'есть' : 'нет' ),
      },
      {
        key: `КВС
        (возраст-стаж)`,
        value: this.calcKBS(),
        label: 'Коэфф '+this.calcKBS(),
      },
      {
        key: `КС
        (период использования)`,
        value:RANGE[this.state.range].k,
        label:RANGE[this.state.range].label
      },
      {
        key: `КП
        (срок страхования)`,
        value: 1,
        label: ''
      },

    ];

    if (this.state.withTrailer === true) {
      multiplies.push({
        key: `КПр
        (прицеп)`,
        value: this.calcTrailer(),
        label: 'используется'
      });
    }

    if (this.state.ts === 2 || this.state.ts === 3 || this.state.ts === 4 ) {
      multiplies.push({
        key: `КМ
        (мощность)`,
        value: POWER[this.state.power].k,
        label: POWER[this.state.power].label,
      });
    }


    let totalMultiplier = 1;
    for( let multiply in multiplies ){
      totalMultiplier = totalMultiplier * multiplies[multiply].value;
    }

    if(totalMultiplier > 3*CITIES[this.state.region][this.state.city][(this.state.ts == 11 ? 2 : 1)]) {
      totalMultiplier = 3*CITIES[this.state.region][this.state.city][(this.state.ts == 11 ? 2 : 1)];
    }


    payload = payload + '<br/>Стоимость: ' + ((
      typeof this.state.base === 'number'
      ?
      (this.state.base*totalMultiplier).toFixed(2).replace('.',',')
      :
      ((this.state.base[0]*totalMultiplier).toFixed(2).replace('.',',')+' - '+(this.state.base[1]*totalMultiplier).toFixed(2).replace('.',','))
      )+'₽');

      try {
        if (typeof this.state.callbackTriggerSend === 'function') {
          this.state.callbackTriggerSend();
        }
      } catch (e){}

    $.ajax({
      url: this.state.sender,
      type: "post",
      context: this,
      data:({
				name:this.state.name,
				contact:this.state.phone,
				calcId:this.state.calcId,
				result:payload
			}),

			beforeSend: function( ) {
				$(".window .response").text('Отправка...');
			},
			success: function( data ) {
        this.setState({'view':'sent'});
				$(".window .response").text( data );
			},
			error: function (xhr, ajaxOptions, thrownError) {
        console.log(xhr);
				$(".window .response").html( xhr.responseText );
			}
		});

  }

  toggleTrailer() {
    this.setState({ withTrailer : !this.state.withTrailer });
  }

  toggleDriver() {
    this.setState({ multiDriver : !this.state.multiDriver });
  }

  addDriver(e) {
    e.preventDefault();
    let drivers = this.state.driverList;
    drivers.push(NEW_DRIVER);
    this.setState({ driverList: drivers });
  }

  editDriver(index, param, id) {
    let driverList = this.state.driverList;
    let driver = driverList[index];
    var updatedDriver;
    if( param === 'age' ){
      updatedDriver = {
        age: id,
        experience: driver.experience,
        bms: driver.bms
      }
    } else if( param === 'experience' ){
      updatedDriver = {
        age: driver.age,
        experience: id,
        bms: driver.bms
      }
    } else if( param === 'bms' ){
      updatedDriver = {
        age: driver.age,
        experience: driver.experience,
        bms: id
      }
    }

    driverList[index] = updatedDriver;

    this.setState({ driverList: driverList });
  }

  removeDriver(index,e) {
    e.preventDefault();
    let drivers = this.state.driverList;
    drivers.splice(index, 1);
    this.setState({ driverList: drivers });
  }

  handleSetTS(id) {

    if( this.state.customBase === null ){
      this.setState({ ts: ~~id, base: [~~TS[id].baseMin, ~~TS[id].baseMax] });
    }else{

      if( this.state.customBase[id].base ){
        this.setState({ ts: ~~id, base: ~~this.state.customBase[id].base });
      }else if(
        this.state.customBase[id].baseMin &&
        this.state.customBase[id].baseMax &&
        ~~this.state.customBase[id].baseMin !== 0 &&
        ~~this.state.customBase[id].baseMax !== 0
      ){
        this.setState({ ts: ~~id, base: [~~this.state.customBase[id].baseMin, ~~this.state.customBase[id].baseMax] });
      } else{
        this.setState({ ts: ~~id, base: [~~TS[id].baseMin, ~~TS[id].baseMax] });
      }

    }
  }

  calcKBS() {
    let KBS = 0;
    if (this.state.multiDriver === true) {
      KBS = 1;
      return KBS;
    }

    for (let i = 0; i < this.state.driverList.length; i++) {
      let nextKBS = 0;
      let driver = this.state.driverList[i];
      if (driver.age <= 22 && driver.experience < 3) {
        nextKBS = 1.8;
      } else if (driver.age > 22 && driver.experience < 3) {
        nextKBS = 1.7;
      } else if (driver.age <= 22 && driver.experience >= 3) {
        nextKBS = 1.6;
      } else if (driver.age > 22 && driver.experience >= 3) {
        nextKBS = 1;
      }
      if (nextKBS > KBS) {
        KBS = nextKBS;
      }
    }
    return KBS;
  }

  calcKBM() {
    let KBS = 0;
    if (this.state.multiDriver === true) {
      return BMS[this.state.multiDriverBMS].k;
    }

    for (let i = 0; i < this.state.driverList.length; i++) {
      if (BMS[this.state.driverList[i].bms].k > KBS) {
        KBS = BMS[this.state.driverList[i].bms].k;
      }
    }

    return KBS;
  }

  calcTrailer() {
    let KPr = 1;

    if (
      this.state.ts === 2 ||
      this.state.ts === 3 ||
      ( this.state.ts === 4 && this.state.ownerIsJur === 1 ) ||
      ( this.state.ts === 1 && this.state.ownerIsJur === 1 )
    ) {
      KPr = 1.16;
    }

    if (
      this.state.ts === 5
    ) {
      KPr = 1.4;
    }

    if (
      this.state.ts === 6
    ) {
      KPr = 1.25;
    }

    if (
      this.state.ts === 11
    ) {
      KPr = 1.24;
    }

    return KPr;
  }

  render() {

    let regions = {};
    for( let row in CITIES ){
      regions[row] = {label: CITIES[row][0][3] };
    }

    let citiesOfRegion = {};
    for( let i = 0; i < CITIES[this.state.region].length ; i++ ){
      citiesOfRegion[i] = { label: CITIES[this.state.region][i][0] };
    }

    let filteredTS = {}
    for( let row in TS ){
      if( TS[row].hasOwnProperty('isJur') ){
        if( TS[row].isJur == this.state.ownerIsJur ){
          filteredTS[row] = TS[row];
        }
      }else{
        filteredTS[row] = TS[row];
      }
    }

    let multiplies = []
    multiplies = [
      {
        key: `КТ
        (терр.)`,
        value: CITIES[this.state.region][this.state.city][(this.state.ts == 11 ? 2 : 1)],
        label: CITIES[this.state.region][this.state.city][0]
      },
      {
        key: `КБМ
        (бонус-малус)`,
        value: this.calcKBM(),
        label: 'Коэфф '+this.calcKBM(),
      },
      {
        key: `КО
        (мульти-драйв)`,
        value: ( this.state.multiDriver ? 1.8 : 1 ),
        label: ( this.state.multiDriver ? 'есть' : 'нет' ),
      },
      {
        key: `КВС
        (возраст-стаж)`,
        value: this.calcKBS(),
        label: 'Коэфф '+this.calcKBS(),
      },
      {
        key: `КС
        (период использования)`,
        value:RANGE[this.state.range].k,
        label:RANGE[this.state.range].label
      },
      {
        key: `КП
        (срок страхования)`,
        value: 1,
        label: ''
      },

    ];

    if (this.state.withTrailer === true) {
      multiplies.push({
        key: `КПр
        (прицеп)`,
        value: this.calcTrailer(),
        label: 'используется'
      });
    }

    if (this.state.ts === 2 || this.state.ts === 3 || this.state.ts === 4 ) {
      multiplies.push({
        key: `КМ
        (мощность)`,
        value: POWER[this.state.power].k,
        label: POWER[this.state.power].label,
      });
    }


    let totalMultiplier = 1;
    for( let multiply in multiplies ){
      totalMultiplier = totalMultiplier * multiplies[multiply].value;
    }

    if(totalMultiplier > 3*CITIES[this.state.region][this.state.city][(this.state.ts == 11 ? 2 : 1)]) {
      totalMultiplier = 3*CITIES[this.state.region][this.state.city][(this.state.ts == 11 ? 2 : 1)];
    }



    let view = null;

    if(this.state.view === 'calc'){
      view = (
        <div>
        { this.state.calcTitle === null ? <h2 className="title">Калькулятор ОСАГО</h2> : <h2 className="title">{this.state.calcTitle}</h2> }
        <div className="form-group">
          <div className="title">Собственник транспортного средства</div>
          <DropDown
            options={OWNER}
            value={this.state.ownerIsJur}
            label={OWNER[this.state.ownerIsJur].label}
            onChange={(id) => {
              if (TS[this.state.ts].hasOwnProperty('isJur')) {
                if( this.state.ts === 2 ){ this.setState({ ts: 3 }); }
                else if( this.state.ts === 3 ){ this.setState({ ts: 2 }); }
              }
              this.setState({ ownerIsJur: ~~id , multiDriver: ~~id });
            }}
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
            options={filteredTS}
            value={this.state.ts}
            label={filteredTS[this.state.ts].label}
            onChange={(id) => (this.handleSetTS(id))}
          />
        </div>

        <div className="form-group">
          <div className="title">Мощность двигателя</div>
          <DropDown
            disabled={!( this.state.ts === 2 || this.state.ts === 3 || this.state.ts === 4 )}
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

        <h3 className="title">Список водителей</h3>

        <div className="form-group -full">
          <input type="checkbox" onChange={this.toggleDriver} checked={this.state.multiDriver?'checked':''} disabled={this.state.ownerIsJur===1?'disabled':''} id="multiDriver" />
          <label htmlFor="multiDriver">Неограниченное число водителей (мультидрайв)</label>
        </div>
        {
          this.state.multiDriver ?
          (
            <div className="row-group">
              <div className="form-group -full">
                <div className="title">Коэффициент безаварийности (<a href={this.state.checkBmsLink} target="_blank">проверить</a>) <span className="ico-q" data-tooltip="КБМ, коэфициент бонус-малус, определяется по единой базе РСА, в которой зафиксированы прошлые страховые случаи (ДТП) по водителю. Для страхующихся впервые равен единице (класс 3)"></span></div>
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
                    onChange={(id) => { this.editDriver.call(this,index,'age',id) }}
                  />
                </div>
                <div className="form-group -half">
                  <div className="title">Стаж</div>
                  <DropDown
                    options={EXPERIENCE}
                    value={item.experience}
                    label={EXPERIENCE[item.experience].label}
                    onChange={(id) => { this.editDriver.call(this,index,'experience',id) }}
                  />
                </div>
                <div className={'form-group -double' + (this.state.driverList.length > 1 ? ' -minusone' : '')}>
                  <div className="title">Коэффициент безаварийности (<a href={this.state.checkBmsLink} target="_blank">проверить</a>) <span className="ico-q" data-tooltip="КБМ, коэфициент бонус-малус, определяется по единой базе РСА, в которой зафиксированы прошлые страховые случаи (ДТП) по водителю. Для страхующихся впервые равен единице (класс 3)"></span></div>
                  <DropDown
                    options={BMS}
                    value={item.bms}
                    label={BMS[item.bms].label}
                    onChange={(id) => { this.editDriver.call(this,index,'bms',id) }}
                  />
                </div>
                {this.state.driverList.length > 1 ?
                  <div className="form-group -one">
                    <a href="#" className="remove" onClick={this.removeDriver.bind(this,index)}>Удалить</a>
                  </div>
                : <div/> }

              </div>
            );
          }, this)
        }

        {
          !this.state.multiDriver && this.state.driverList.length < 5 ?
          (
            <div className="form-group -full">
              <a href="#" className="add" onClick={this.addDriver}>Добавить еще одного водителя</a>
            </div>
          ) : <div/>
        }


        <button onClick={(e)=>{
          try {
            if (typeof this.state.callbackTriggerCalc === 'function') {
              this.state.callbackTriggerCalc();
            }
          } catch (e){}
          $('html,body').animate({scrollTop: $("#root").offset().top},'slow');
          this.setState({ view: 'result' });
        }}>Рассчитать</button>
        </div>
      );
    }
    else if (this.state.view == 'result' || this.state.view == 'order'){
      view = (
        <div>
        <h2 className="title">Стоимость полиса ОСАГО:</h2>

        <div className="price">
        {
          typeof this.state.base === 'number'
          ?
          (this.state.base*totalMultiplier).toFixed(2).replace('.',',')
          :
          ((this.state.base[0]*totalMultiplier).toFixed(2).replace('.',',')+' - '+(this.state.base[1]*totalMultiplier).toFixed(2).replace('.',','))
        }
        {` `}₽</div>

        <div className="base-price">Базовый тариф:{` `}
          <span className="number">
            {
              typeof this.state.base === 'number'
              ?
              this.state.base : (this.state.base[0]+' - '+this.state.base[1])
            } ₽ (в зависимости от страховой компании)
          </span>
        </div>

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
          <a href="#" className="back" onClick={(e)=>{e.preventDefault();$('html,body').animate({scrollTop: $("#root").offset().top},'slow');this.setState({view:'calc'})}}>Рассчитать еще раз</a>
        </div>

        <button onClick={(e)=>(this.setState({view:'order'}))}>Заказать полис ОСАГО с бесплатной доставкой</button>
        <div style={{marginTop: '16px'}} dangerouslySetInnerHTML={{__html:this.state.marketingHtml}}></div>
        </div>
      );
    }

    let modal = null;

    if(this.state.view == 'order' || this.state.view == 'sent'){
      modal = (
        <div className="overlay">
          <div className="window">
            <a href="#" onClick={(e)=>{e.preventDefault();$('html,body').animate({scrollTop: $("#root").offset().top},'slow');this.setState({view:'result'})}} className="close">Назад</a>
            <h3 className="title">Перезвоним для уточнения стоимости, страховой компании и способа доставки</h3>
            <div className="row-group" style={this.state.view == 'sent'?{display:'none'}:{}}>
              <div className="form-group -full">
                <div className="title">Имя</div>
                <input type="text" ref="name" className={this.state.nameErr?'error':''} value={this.state.name}
                onChange={(e)=>(this.setState({name:e.target.value, nameErr: false}))} placeholder="Иванов Иван Иванович" />
              </div>
            </div>
            <div className="row-group" style={this.state.view == 'sent'?{display:'none'}:{}}>
              <div className="form-group -full">
                <div className="title">Телефон</div>
                <InputElement mask="+7-999-999-99-99" defaultValue="7" type="text" ref="phone" className={this.state.phoneErr?'error':''} value={this.state.phone}
                onChange={(e)=>{this.setState({phone:e.target.value,phoneErr: false})}}  placeholder="+7-900-000-00-00" />
              </div>
            </div>
            <button onClick={this.sendOrder} style={this.state.view == 'sent'?{display:'none'}:{}}>Заказать полис</button>
            <div className="note" style={this.state.view == 'sent'?{display:'none'}:{}}>Ваши персональные данные не будут переданы третьим лицам</div>
            <div className="response"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="calculator-osago">
        {view}
        {modal}
      </div>
    );
  }
}


render((
  <App />
), document.getElementById('root'));
