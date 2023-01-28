import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TodayMarker,
  TimelineMarkers,
} from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { useState } from 'react';
import './style.css';
import { faker } from '@faker-js/faker';

interface ItemsProps {
  id: number;
  group: number;
  title: string;
  start_time: moment.Moment;
  end_time: moment.Moment;
  canMove?: boolean;
  canResize?: boolean;
  canChangeGroup?: boolean; // não permite mover o item entre os grupos
  itemProps?: {};
  selectedBgColor?: string;
  bgColor?: string;
  color?: string;
}

interface Group {
  id: number;
  title: string;
  rightTitle: string; // essa propriedade é adicionada no menu lateral direito, ela popula as linhas
  stackItems?: boolean;
  height?: number;
}

function App() {
  const DEFAULT_TIME_START = moment().startOf('day').toDate(); // especifica a hora de onde o calendário começa
  const DEFAULT_TIME_END = moment().startOf('day').add(1, 'day').toDate(); // especifica a hora que de onde o calendário termina
  let groups: Group[] = [];

  const [items, setItems] = useState<ItemsProps[]>([
    {
      id: 1,
      group: 1,
      title: 'Malhar',
      start_time: moment(), // vai inicializar com a hora atual
      end_time: moment().add(1, 'hour'), // vai finalizar 1 hora após a hora atual
      selectedBgColor: 'rgba(225, 166, 244, 1)',
      bgColor: 'rgba(244, 6, 177, 0.6)',
      color: 'rgba(48, 5, 39, 0.6)',
    },
    {
      id: 2,
      group: 2,
      title: 'Jantar',
      start_time: moment().add(-0.5, 'hour'), // vai inicializar meia hora antes da hora atual
      end_time: moment().add(0.5, 'hour'),
      itemProps: {
        onDoubleClick: () => {
          alert('Chamado quando o usuário clica duas vezes!');
        },
        style: {
          background: 'red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        },
      },
    },
    {
      id: 3,
      group: 1,
      title: 'Estudar',
      start_time: moment().add(2, 'hour'), // vai inicializar 2 horas após a hora atual
      end_time: moment().add(5, 'hour'), // vai finalizar 5 horas após a hora atual
      itemProps: {
        style: {
          background: 'green',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        },
      },
    },
  ]);

  for (let i = 0; i < 40; i++) {
    groups.push({
      id: i,
      title: faker.name.firstName(),
      rightTitle: faker.name.lastName(),
    });
  }

  const itemRenderer = ({
    item,
    itemContext,
    getItemProps,
    getResizeProps,
  }) => {
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    const backgroundColor = itemContext.selected
      ? itemContext.dragging
        ? 'red'
        : item.selectedBgColor
      : item.bgColor;
    const borderColor = itemContext.resizing ? 'red' : item.color;
    return (
      <div
        {...getItemProps({
          style: {
            backgroundColor,
            color: item.color,
            borderColor,
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 4,
            borderLeftWidth: itemContext.selected ? 3 : 1,
            borderRightWidth: itemContext.selected ? 3 : 1,
          },
        })}
      >
        {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

        <div
          style={{
            height: itemContext.dimensions.height,
            overflow: 'hidden',
            paddingLeft: 3,
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {itemContext.title}
        </div>

        {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
      </div>
    );
  };

  const handleItemMove = (
    itemId: number,
    dragTime: number,
    newGroupOrder: number
  ) => {
    const group = groups[newGroupOrder];

    const newItems = items.map((item) => {
      return item.id === itemId
        ? Object.assign({}, item, {
            group: group.id,
            start_time: moment(dragTime),
            end_time: moment(
              dragTime + (Number(item.end_time) - Number(item.start_time))
            ),
          })
        : item;
    });

    setItems([...newItems]);
  };

  const handleItemResize = (itemId: number, time: number, edge: string) => {
    const newItems = items.map((item) => {
      return item.id === itemId
        ? Object.assign({}, item, {
            start_time: edge === 'left' ? time : item.start_time,
            end_time: edge === 'left' ? item.end_time : time,
          })
        : item;
    });

    setItems([...newItems]);
  };

  return (
    <div>
      <Timeline
        groups={groups}
        lineHeight={40}
        sidebarWidth={200}
        rightSidebarWidth={150} // precisa colocar para o cabeçalho aparecer á direita
        canChangeGroup={true} // permite mover os itens entre os grupos
        items={items}
        stackItems // empilha os items um após o outro quando o tempo forem iguais, para um não sobrescrever o outro
        itemHeightRatio={0.75} // altura dos items
        canMove={true} // permite mover o item
        canResize={'both'} // permite rendimensionar para ambos os lados
        defaultTimeStart={DEFAULT_TIME_START}
        defaultTimeEnd={DEFAULT_TIME_END}
        itemRenderer={itemRenderer}
        onItemMove={handleItemMove} // chama a função de mover
        onItemResize={handleItemResize} // chama a função de renderização
      >
        <TimelineHeaders
          className="sticky"
          // estiliza o header que tem "funcionários do mês" e as horas
          style={{
            display: 'flex',
            alignItems: 'center',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '18px',
            fontFamily: 'Helvetica',
            color: '#323238',
          }}
          // estiliza a parte que tem a data por extenso "ex.: tuesday, January 24, 2023"
          calendarHeaderStyle={{
            textTransform: 'capitalize',
            fontFamily: 'Helvetica',
          }}
        >
          <SidebarHeader headerData={{ someData: 'da esquerda' }}>
            {({ getRootProps, data }) => {
              return <div {...getRootProps()}>Menu {data.someData}</div>;
            }}
          </SidebarHeader>
          <SidebarHeader variant="right">
            {({ getRootProps }) => {
              return <div {...getRootProps()}>Menu da direita</div>;
            }}
          </SidebarHeader>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
          <DateHeader unit="day" labelFormat="DD/MM" />
        </TimelineHeaders>
        <TimelineMarkers>
          {/*Marca uma linha, adiciona uma linha vertucal na deta passada */}
          <TodayMarker date={Date.now()} />
        </TimelineMarkers>
      </Timeline>
    </div>
  );
}

export default App;
