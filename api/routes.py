from flask import Blueprint, request, jsonify

api = Blueprint('api', __name__)

VALID_MODELS = {'randomforest', 'logisticregression'}


def init_routes(model_service):
    @api.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'service': 'glucocare-ml'})

    @api.route('/randomforest', methods=['POST'])
    def random_forest():
        return _predict(model_service, 'randomforest')

    @api.route('/logisticregression', methods=['POST'])
    def logistic_regression():
        return _predict(model_service, 'logisticregression')

    return api


def _predict(model_service, model_name: str):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Request body is required'}), 400
        result = model_service.predict(model_name, data)
        return jsonify(result)
    except Exception as exc:
        return jsonify({'status': 'error', 'message': str(exc)}), 400
