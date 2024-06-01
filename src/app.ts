// 複数のプロジェクトを管理するアプリを作成
/**
 * 1.formを表示しユーザーの入力を受け取る
 * 2.ユーザーの入力を取得してバリデーションチェック
 * 3.新しいリストを作成して画面に表示する
 */

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

// formを表示しユーザーの入力を受け取るためのクラス
//projectInput Class
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
