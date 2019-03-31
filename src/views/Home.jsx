import React, {Component} from 'react';
import {Form, Button} from 'react-bootstrap';
import logo from '../logo.svg';
import '../assets/css/App.css';
import {Connection} from 'autobahn';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            velocidade: 0,
            passos: 0,
            validated: false,
            connection: new Connection({
                transports: [
                    {
                        'type': 'websocket',
                        'url': 'ws:' + '//' + 'crossbar-pedro.herokuapp.com' + '/ws'
                    }
                ], realm: 'realm1'
            }),
            texto: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.state.connection.onopen = function (session, details) {
            session.subscribe('com.example.texto', function (args, kwargs) {
                console.log(args);
                console.log(kwargs);
                this.setState({texto: 'OK'});
            }).then(function (subs) {
                console.log(subs);
            });

            session.publish('com.example.texto',['MAOE','AOE']);
        };
        this.state.connection.open();
    }

    handleChange(event) {
        if (event.target.name === 'velocidade')
            this.setState({'velocidade': parseInt(event.target.value)});
        else if (event.target.name === 'passos')
            this.setState({'passos': parseInt(event.target.value)});
        console.log(this.state.texto);
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            this.state.connection.session.publish('com.example.texto', ['Inválido']);
            return;
        }
        this.setState({validated: true});
        this.state.connection.session.publish('com.example.texto', ['Válido']);
        console.log(this.state.connection.session);
    }

    handleReset(event) {
        this.setState({
            passos: 0,
            velocidade: 0
        })
    }

    render() {
        const {validated} = this.state;
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt='Logo'/>
                    {this.state.texto}
                    <Form onSubmit={this.handleSubmit} noValidate
                          validated={validated}>
                        <Form.Group controlId="velocidade">
                            <Form.Label>
                                Velocidade: {this.state.velocidade}
                            </Form.Label>
                            <Form.Control type='range' min={0} max={1000} value={this.state.velocidade}
                                          name='velocidade' onChange={this.handleChange}/>
                            <Form.Text className="text-muted">
                                Controla a velocidade do motor
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="passos">
                            <Form.Label>
                                Passos: {this.state.passos}
                            </Form.Label>
                            <Form.Control type='number' onChange={this.handleChange} name='passos'/>
                            <Form.Control.Feedback type='invalid'>Necessita ser um número</Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Número de passos do motor
                            </Form.Text>
                        </Form.Group>
                        <Form.Group>
                            <Form.Control type='reset' onClick={this.handleReset}/>
                        </Form.Group>
                        <Button type='submit' variant='info'>Submit</Button>
                    </Form>
                </header>
            </div>
        );
    }
}

export default Home;
