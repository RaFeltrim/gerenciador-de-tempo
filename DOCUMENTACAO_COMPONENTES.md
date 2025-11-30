# FocusFlow - Documentação de Componentes

Este documento detalha todos os componentes React do projeto FocusFlow.

---

## Índice

1. [Componentes de UI](#componentes-de-ui)
   - [Button](#button)
2. [Componentes de Funcionalidade](#componentes-de-funcionalidade)
   - [PomodoroTimer](#pomodorotimer)
   - [TaskItem](#taskitem)
3. [Páginas](#páginas)
   - [Landing Page](#landing-page)
   - [Dashboard](#dashboard)

---

## Componentes de UI

### Button

**Arquivo**: `src/components/ui/button.tsx`

**Tipo**: Componente de UI base

#### Descrição
Botão reutilizável com múltiplas variantes e tamanhos para uso em toda a aplicação.

#### Props Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
```

#### Variantes Disponíveis

| Variante | Uso | Aparência |
|----------|-----|-----------|
| `default` | Ações primárias | Fundo colorido (primary) |
| `destructive` | Ações perigosas (deletar) | Vermelho |
| `outline` | Ações secundárias | Apenas borda |
| `secondary` | Ações alternativas | Fundo cinza |
| `ghost` | Ações sutis | Transparente com hover |
| `link` | Links estilizados | Sublinhado |

#### Tamanhos

| Tamanho | Altura | Padding |
|---------|--------|---------|
| `default` | h-10 | py-2 px-4 |
| `sm` | h-9 | px-3 |
| `lg` | h-11 | px-8 |
| `icon` | h-10 w-10 | - |

#### Exemplo de Uso

```tsx
import { Button } from '@/components/ui/button';

// Botão primário
<Button>Salvar</Button>

// Botão de exclusão
<Button variant="destructive">Excluir</Button>

// Botão outline
<Button variant="outline" size="sm">Cancelar</Button>

// Botão ícone
<Button variant="ghost" size="icon">
  <Icon />
</Button>
```

#### Acessibilidade
- Suporte a `disabled`
- Estados de foco visíveis
- Compatível com leitores de tela

---

## Componentes de Funcionalidade

### PomodoroTimer

**Arquivo**: `src/components/PomodoroTimer.tsx`

**Tipo**: Componente funcional de timer

#### Descrição
Timer baseado na técnica Pomodoro com sessões de 25 minutos de foco.

#### Props Interface

```typescript
interface PomodoroTimerProps {
  initialTime?: number;      // Tempo inicial em segundos (padrão: 1500 = 25 min)
  onTimerEnd?: () => void;   // Callback executado quando timer chega a zero
}
```

#### Estados Internos

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `timeLeft` | `number` | Segundos restantes |
| `isRunning` | `boolean` | Se timer está ativo |

#### Funcionalidades

1. **Iniciar**: Começa a contagem regressiva
2. **Pausar**: Para a contagem mantendo o tempo atual
3. **Resetar**: Volta ao tempo inicial

#### Callback onTimerEnd

Executado automaticamente quando:
- Timer chega a zero
- Timer para de rodar

#### Exemplo de Uso

```tsx
import { PomodoroTimer } from '@/components/PomodoroTimer';

// Timer padrão (25 min)
<PomodoroTimer />

// Timer customizado com callback
<PomodoroTimer 
  initialTime={15 * 60} // 15 minutos
  onTimerEnd={() => {
    console.log('Tempo esgotado!');
    playNotificationSound();
  }}
/>
```

#### Estrutura Visual

```
┌─────────────────────────────────────┐
│                                     │
│            25:00                    │  ← Display do tempo
│                                     │
│    [▶ Iniciar]  [↺ Resetar]        │  ← Botões de controle
│                                     │
└─────────────────────────────────────┘
```

#### Estilos

- Container com glassmorphism
- Display de tempo em fonte mono
- Botão Iniciar: gradiente indigo
- Botão Pausar: gradiente vermelho
- Botão Resetar: fundo cinza

---

### TaskItem

**Arquivo**: `src/components/TaskItem.tsx`

**Tipo**: Componente de exibição de tarefa

#### Descrição
Exibe uma tarefa individual com todas suas informações e ações disponíveis.

#### Props Interface

```typescript
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer?: (id: string) => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null;    // minutos
  dueDate: string | null;          // ISO string
  completed: boolean;
  createdAt: string;
  category?: string | null;
  tags?: string[];
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
  parentTaskId?: string | null;
}
```

#### Categorias Disponíveis

| ID | Nome | Cor Badge |
|----|------|-----------|
| `work` | Trabalho | bg-blue-100 text-blue-700 |
| `personal` | Pessoal | bg-purple-100 text-purple-700 |
| `study` | Estudo | bg-green-100 text-green-700 |
| `health` | Saúde | bg-red-100 text-red-700 |
| `finance` | Finanças | bg-yellow-100 text-yellow-700 |
| `other` | Outros | bg-gray-100 text-gray-700 |

#### Prioridades

| Prioridade | Label | Cor |
|------------|-------|-----|
| `high` | Alta | Vermelho |
| `medium` | Média | Âmbar |
| `low` | Baixa | Verde |

#### Funcionalidades

| Ação | Ícone | Descrição |
|------|-------|-----------|
| Toggle | ○/✓ | Marca tarefa como completa/incompleta |
| Edit | ✏️ | Abre formulário de edição |
| Delete | 🗑️ | Remove a tarefa |
| Timer | ⏱️ | Inicia Pomodoro para esta tarefa |

#### Lógica de Descrição

A descrição é ocultada se:
- For vazia ou null
- For muito similar ao título (diferença < 10 caracteres)

```typescript
const isDescriptionRedundant = (title: string, description: string): boolean => {
  if (!description || !title) return true;
  
  if (description.length > title.length + 10) {
    return false;
  }
  
  const normalizeString = (str: string) => 
    str.toLowerCase().replace(/\s+/g, ' ').trim();
  
  return normalizeString(title) === normalizeString(description);
};
```

#### Exemplo de Uso

```tsx
import { TaskItem } from '@/components/TaskItem';

const task = {
  id: '1',
  title: 'Reunião de equipe',
  description: 'Discutir sprint planning',
  priority: 'high',
  estimatedTime: 60,
  dueDate: '2025-12-01T14:00:00.000Z',
  completed: false,
  createdAt: '2025-11-30T10:00:00.000Z',
  category: 'work',
  tags: ['importante', 'equipe'],
  isRecurring: true,
  recurrencePattern: 'weekly'
};

<TaskItem
  task={task}
  onToggle={(id) => console.log('Toggle', id)}
  onDelete={(id) => console.log('Delete', id)}
  onEdit={(task) => console.log('Edit', task)}
  onStartTimer={(id) => console.log('Timer', id)}
/>
```

#### Estrutura Visual

```
┌──────────────────────────────────────────────────────────────┐
│ ○ Reunião de equipe                          [⏱️][✏️][🗑️]   │
│   Discutir sprint planning                                    │
│                                                               │
│   [🚩 Alta] [🔄 Semanal] [Trabalho] [⏰ 60 min] [📅 01/12]   │
│   #importante #equipe                                         │
└──────────────────────────────────────────────────────────────┘
```

---

## Páginas

### Landing Page

**Arquivo**: `src/app/page.tsx`

**Rota**: `/`

#### Descrição
Página inicial da aplicação para usuários não autenticados.

#### Seções

1. **Hero Section**
   - Título principal
   - Descrição do produto
   - Botão de login com Google
   - Cards de features

2. **Features Grid**
   - Agendamento Inteligente
   - Pomodoro Timer
   - Metas e Progresso

3. **Features Section**
   - IA Integrada
   - Extração Inteligente de Tarefas
   - Demo visual

4. **CTA Section**
   - Call to action final
   - Botão de registro

#### Comportamento de Autenticação

```typescript
useEffect(() => {
  if (session) {
    router.push('/dashboard');
  }
}, [session, router]);
```

Se usuário já está autenticado, redireciona para dashboard.

---

### Dashboard

**Arquivo**: `src/app/dashboard/page.tsx`

**Rota**: `/dashboard`

#### Descrição
Página principal da aplicação para usuários autenticados.

#### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Header: Logo | Sync | User Info | Logout                       │
├────────────────────────────────────────────────────────────────┤
│ Quick Stats: Tarefas | Concluídas | Google Tasks | Eventos     │
├──────────────────────────────────────┬─────────────────────────┤
│ Main Content                         │ Sidebar                 │
│                                      │                         │
│ ┌──────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ Nova Tarefa (Input + AI)         │ │ │ Pomodoro Timer      │ │
│ └──────────────────────────────────┘ │ └─────────────────────┘ │
│                                      │                         │
│ ┌──────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ Tasks Tabs                       │ │ │ Mini Calendário     │ │
│ │ - Minhas Tarefas                 │ │ └─────────────────────┘ │
│ │ - Google Tasks                   │ │                         │
│ │                                  │ │ ┌─────────────────────┐ │
│ │ [Lista de Tarefas]               │ │ │ Próximos Eventos    │ │
│ │                                  │ │ └─────────────────────┘ │
│ └──────────────────────────────────┘ │                         │
│                                      │ ┌─────────────────────┐ │
│                                      │ │ Status de Conexões  │ │
│                                      │ └─────────────────────┘ │
└──────────────────────────────────────┴─────────────────────────┘
```

#### Estados Gerenciados

| Estado | Tipo | Descrição |
|--------|------|-----------|
| `tasks` | `Task[]` | Tarefas locais |
| `googleTasks` | `GoogleTask[]` | Tarefas do Google |
| `calendarEvents` | `CalendarEvent[]` | Eventos do calendário |
| `newTaskText` | `string` | Input de nova tarefa |
| `isLoading` | `boolean` | Estado de carregamento |
| `timerSeconds` | `number` | Timer atual |
| `isTimerRunning` | `boolean` | Timer ativo |
| `activeTaskId` | `string \| null` | Tarefa com timer |
| `editingTaskId` | `string \| null` | Tarefa em edição |
| `activeTab` | `'local' \| 'google'` | Tab selecionada |

#### Funcionalidades Principais

1. **Criação de Tarefa**
   - Input com processamento NLP
   - Opções avançadas (duração, categoria, tags)
   - Sincronização automática com Google

2. **Listagem de Tarefas**
   - Tabs para tarefas locais e Google
   - Filtro por status
   - Ordenação por prioridade

3. **Edição de Tarefa**
   - Formulário inline
   - Todos os campos editáveis
   - Validação de dados

4. **Timer Pomodoro**
   - Presets de tempo (25, 5, 15 min)
   - Ring visual de progresso
   - Associação com tarefa

5. **Mini Calendário**
   - Navegação por mês
   - Indicadores de eventos
   - Destaque para hoje

6. **Próximos Eventos**
   - Lista dos 5 próximos eventos
   - Destaque para eventos de hoje
   - Informações de data/hora

#### Responsividade

- **Desktop** (lg+): Layout 3 colunas
- **Tablet** (md): Layout 2 colunas
- **Mobile** (sm): Layout 1 coluna, sidebar abaixo

---

## Padrões de Design

### Glassmorphism

Usado em cards e containers:
```css
.glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Gradientes

| Uso | Cores |
|-----|-------|
| Logo/Primary | indigo-500 → purple-600 |
| Botão Primary | indigo-600 → indigo-700 |
| Botão Danger | red-600 → red-700 |
| Feature Cards | Variados por categoria |

### Badges

Padrão para tags e indicadores:
```tsx
<span className="badge bg-{color}-100 text-{color}-700">
  <Icon className="h-3 w-3" />
  Label
</span>
```

---

## Ícones (Lucide React)

### Mapeamento de Ícones

| Contexto | Ícone | Componente |
|----------|-------|------------|
| Calendário | 📅 | `Calendar`, `CalendarDays` |
| Tempo | ⏱️ | `Clock`, `Timer` |
| Prioridade | 🚩 | `Flag` |
| Tags | 🏷️ | `Tag` |
| Editar | ✏️ | `Edit3` |
| Excluir | 🗑️ | `Trash2` |
| Concluído | ✓ | `CheckCircle2` |
| Pendente | ○ | `Circle` |
| Recorrente | 🔄 | `Repeat`, `RefreshCw` |
| Play | ▶ | `Play` |
| Pause | ⏸ | `Pause` |
| Reset | ↺ | `RotateCcw` |
| Cloud | ☁ | `Cloud` |
| Sync | 🔄 | `RefreshCw` |
| Logout | 🚪 | `LogOut` |
| Login | 🔑 | `LogIn` |
| Add | + | `Plus` |
| Sparkles | ✨ | `Sparkles` |
| Target | 🎯 | `Target` |
| Trending | 📈 | `TrendingUp` |
| Zap | ⚡ | `Zap` |

---

## Conclusão

Esta documentação cobre todos os componentes React do FocusFlow, incluindo:
- Props e interfaces
- Exemplos de uso
- Estruturas visuais
- Padrões de design

Para mais detalhes técnicos, consulte o código-fonte e os testes unitários.
