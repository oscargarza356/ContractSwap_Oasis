export const Team = (props) => {
  return (
    <div id="team" className="text-center">
      <div className="container">
        <div className="col-md-8 col-md-offset-2 section-title">
          <h2 class="font-extrabold">Meet the Team</h2>
          <p>
            ContractSwap is created by a new web3 team called MaskedDAO, MaskedDAO goals lay in the creation of new innovative applications done only
            possible thanks to web3 technology.
          </p>
        </div>
        <div id="row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`}>
                  <div className="thumbnail">
                    {" "}
                    <img src={d.img} alt="..." className="team-img rounded" />
                    <div className="caption">
                      <h4 class="font-bold text-black	">{d.name}</h4>
                      <p>{d.job}</p>
                    </div>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};
