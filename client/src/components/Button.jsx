import React from 'react';
import {
    Button,
} from 'framework7-react';
import api from 'api';

async function button(props) {
  const load = api.preload();
  if (props.name) {
    try {
      if (window.models.env.context.editing) await window.models.env.context.edit_function();
      await window.models.env.context.refresh();
      //await api.globals.app.views.main.router.refreshPage();
      if (!window.models.env.context.active_error) {
        await window.models.env.context.active_id[props.name]();
        await window.models.env.context.refresh();
      }
    }
    catch(error) {
      console.log(error);
      await window.models.env.context.refresh();
      //await api.globals.app.views.main.router.refreshPage();
      load.done();
    }
  }
  //await window.models.env.context.refresh();
  load.done();
}

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = window.models.env.context;
  }

  render(props) {
    return (
      <Button fill onClick={() => button.bind(this)(props)} style={{display: (props.invisible instanceof Function ? props.invisible(window.models.env.context.active_id) : props.invisible) ? 'none' : 'block', float: 'left', width: 'auto', margin: '10px'}}>{props.string}</Button>
    );
  }
}
