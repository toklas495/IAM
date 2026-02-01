**Flowcharts are composed of nodes (geometric shapes) and edges (arrows or lines). The Mermaid code defines how nodes and edges are made and accommodates different arrow types, multi-directional arrows, and any linking to and from subgraphs.**

### NODE
```mermaid
    flowchart LR
        id
```

> Instead of flowchart one can also use graph.

### A NODE WITH TEXT 
```mermaid
    graph LR
    id[hello this is cool text]
```

### use *"* to enclose the unicode text
```mermaid
    graph LR
    id["This ❤ Unicode"]
```

### Markdown formating
> Use double quotes and backticks "` text `" to enclose the markdown text.
```mermaid
    graph LR
        markdown["`This **is** _MARKDOWN_`"]
        newLines["`Line1
        Line2
        Line3`"]
        markdown-->newLines
```

### direction
> LR-> left to right TD -> top to down
- LR -> **LEFT_TO_RIGHT**
- TB -> **TOP_TO_BOTTOM**
- TD
- RL
- DT
```mermaid
    graph TD
        top-->down
```

### NODE SHAPE
    > A node with round edge shape
```mermaid
    graph LR
        round_edge("hello i am round edge node")
        stadium_edge(["hello i am stadium edge node"])   
        subroutine_shape[["hello i am subroutine shape"]] 
        cylindrical_shape[("hello i am cylinder")] 
        circle(("hello i am circle"))
        async>hello i am nimesh]
        rhombus{This is the text in the box}
```

## EXPANDED NODEJS SHAPE
```mermaid
    graph TD
        A@{ shape: bolt, label: "Decision"}
```
---

*You can use the icon shape to include an icon in your flowchart. To use icons, you need to register the icon pack first. Follow the instructions to add custom icons. The syntax for defining an icon shape is as follows:*

###ICON SHAPE
```mermaid
    graph TD
        A@{ shape: "fa:user", form: "square", label: "User Icon", pos: "t" ,h:60} 
```

> we can use image also
```mermaid
    graph TD
        A@{ img: "https://picsum.photos/id/237/200/300", label: "this is image", pos: "t", w:60, constraint: "off" }
```

### link between nodes
```mermaid
    graph LR
        A@{shape: "rect" , label: "users"}
        B@{shape: "rect" , label: "sessions"}
        C@{shape: "rect" , label: "refresh"}
        D@{shape: "rect" , label: "credentials"}
        E@{shape: "rect" , label: "accounts"}

        A-->B;A==>C;A-.->D;A-->|i linked with A|E;

```


```mermaid
    graph LR;
    A-->B;
    A --- B;
    A --hello i am nimesh thakur--- B;
    A---|hello i am nimesh thakur|B;
    A-.->B;
```

```mermaid
    graph LR;
    A ==> B;
    C ~~~ D;
```

### Chaining Of Node;
```mermaid
    graph LR;
    A ==> B; B ==> C;C ==> D;
    a --> b & c --> d
```

### lagom;
```mermaid
    flowchart TD
    A & B e1@--> C & D;
    classDef animate stroke-dasharray: 9,5,stroke-dashoffset: 900,animation: dash 25s linear infinite;
    class e1 animate;
```
```mermaid
   flowchart LR
    id1["This is the (text) in the box"]
```

### subgraph
```mermaid
    graph TB;
        c1 --> a2;
    subgraph one
        a1-->a2
    end
    subgraph two
        b1-->b2
    end
    subgraph three
        c1-->c2
    end
```

### subgraph and direction
```mermaid
    graph LR;
    subgraph TOP;
        direction TB;
        subgraph B1;
            direction RL;
                i1 --> f1;
        end
        subgraph B2;
            direction BT;
                i2 --> f2
        end
    end
    A --> TOP --> B;
    B1 --> B2
```


### mardown string
```mermaid
---
config:
  flowchart:
    htmlLabels: false
---
flowchart LR
subgraph "One"
  a("`The **cat**
  in the hat`") -- "edge label" --> b{{"`The **dog** in the hog`"}}
end
subgraph "`**Two**`"
  c("`The **cat**
  in the hat`") -- "`Bold **edge label**`" --> d("The dog in the hog")
end

```


