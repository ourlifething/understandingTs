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
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  // シングルトンであることを保証できる（必ずいつでも一つのインスタンスしか存在しないということ。）
  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  // listener関数をlisteners配列に加える関数
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
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
// projectList Class
// プロジェクトのリストをHTMLに渡して表示するクラス
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    // テンプレートエレメントへの参照
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    // テンプレートを表示する親要素への参照..getElementByIdはどのような型を取得するかわからないためasで型キャストしている。
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjects = [];

    // 画面表示：テンプレートをimportNodeとして取得
    const importedNode = document.importNode(
      this.templateElement.content,
      true // 下の階層も含めてインポートする
    );
    //フォーム、 テンプレートの最初の子要素_importedNodeから具体的なHTMLの要素を取得する必要があるためプロパティを追加。
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

// リストの中のプロジェクトを表示するクラス

// formを表示しユーザーの入力を受け取るためのクラス
//projectInput Class
// フォームの表示を入力値の取得を行うクラス
class ProjectImput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  // ２.入力に対したプロパティを追加
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  // テンプレートや表示先の要素を取得するためのコンストラクター
  constructor() {
    // テンプレートエレメントへの参照
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    // テンプレートを表示する親要素への参照..getElementByIdはどのような型を取得するかわからないためasで型キャストしている。
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    // 画面表示：テンプレートをimportNodeとして取得
    const importedNode = document.importNode(
      this.templateElement.content,
      true // 下の階層も含めてインポートする
    );
    //フォーム、 テンプレートの最初の子要素_importedNodeから具体的なHTMLの要素を取得する必要があるためプロパティを追加。
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input"; // スタイルをあてるcss

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
    this.attach();
  }

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
  // フォームにイベントリスナーを設定する
  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  /**
   * ホストエレメントに要素を追加するinsertAdjacentElementはデフォルトのメソッド引数のafterbeginは(開始タグの直後)
   *  第二引数にimportedNodeを追加したいがconstractorのconstで DocumentFragment型なので直接アクセスできないimportedNodeから具体的なHTMLの要素を取得する必要がある。
   * */
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}
// インスタンスを作成した時にインスタンスに属するフォームを画面に表示
const prjInput = new ProjectImput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
