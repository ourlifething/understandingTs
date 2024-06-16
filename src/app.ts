// 複数のプロジェクトを管理するアプリを作成
/**
 * 1.formを表示しユーザーの入力を受け取る
 * 2.ユーザーの入力を取得してバリデーションチェック
 * 3.新しいリストを作成して画面に表示する
 */
// project type
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}

// 状態管理を行うクラス
// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  // listener関数をlisteners配列に加える関数
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  // シングルトンであることを保証できる（必ずいつでも一つのインスタンスしか存在しないということ。）
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, manday: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      manday,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// validation(バリデーション)
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}
/**
 * autobind decorator
 * デコレーターは３つの引数をうけとる（ターゲット：any、プロパティ名（メソッド名）: string, プロパティでスクリプター: PropertyDescriptor)
 */
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Component Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templatedId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId: string
  ) {
    // テンプレートエレメントへの参照
    this.templateElement = document.getElementById(
      templatedId
    )! as HTMLTemplateElement;
    // テンプレートを表示する親要素への参照..getElementByIdはどのような型を取得するかわからないためasで型キャストしている。
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true // 下の階層も含めてインポートする
    );
    //フォーム、 テンプレートの最初の子要素_importedNodeから具体的なHTMLの要素を取得する必要があるためプロパティを追加。
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }
  abstract configure(): void;
  abstract renderContent(): void;

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

// projectList Class
// プロジェクトのリストをHTMLに渡して表示するクラス
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }
  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
        prj.status;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }
  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
}

// リストの中のプロジェクトを表示するクラス

// formを表示しユーザーの入力を受け取るためのクラス
//projectInput Class
// フォームの表示を入力値の取得を行うクラス
class ProjectImput extends Component<HTMLDivElement, HTMLFormElement> {
  // ２.入力に対したプロパティを追加
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  // テンプレートや表示先の要素を取得するためのコンストラクター
  constructor() {
    super("project-input", "app", true, "user-input");
    // 2.入力を取得するための操作
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector(
      "#manday"
    ) as HTMLInputElement;

    this.configure();
  }
  // フォームにイベントリスナーを設定する
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
  renderContent() {}

  // 簡単なバリデーションを実装し入力値を返す
  private gatherUseuInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManday = this.mandayInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const mandayValidatable: Validatable = {
      value: +enteredManday,
      required: true,
      min: 1,
      max: 1000,
    };
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(mandayValidatable)
      //   trim()最初と最後の空白を除去する
      //   enteredTitle.trim().length === 0 ||
      //   enteredDescription.trim().length === 0 ||
      //   enteredManday.trim().length === 0
    ) {
      alert("入力値が正しくありません。再度お試しください。");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredManday];
    }
  }

  // 入力した文字をクリア（消す）するメソッド、submitHandlerで呼び出す。
  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.mandayInputElement.value = "";
  }
  // イベントリスナーのレシーバー関数
  @autobind // tsconfigでデコレーターの設定をONにしなくてはエラーとなる
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUseuInput();
    // tupleかどうかのチェックタプルは配列のため
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      projectState.addProject(title, desc, manday);
      console.log(title, desc, manday);
      this.clearInputs();
    }
    // console.log(this.titleInputElement.value);
  }
}
// インスタンスを作成した時にインスタンスに属するフォームを画面に表示
const prjInput = new ProjectImput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
